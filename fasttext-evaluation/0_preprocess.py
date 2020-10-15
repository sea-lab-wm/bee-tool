import os
from pathlib import Path

import xmltodict
from nltk import WordNetLemmatizer, word_tokenize

import utils


def read_files(path):
    all_bugs = []
    for _, _, files in os.walk(path):
        for file in files:
            if file.endswith(".xml"):
                with open(os.path.join(path, file), encoding="utf-8") as fd:
                    doc = xmltodict.parse(fd.read())
                    all_bugs.append(doc)
    return all_bugs


def preprocess_text(text):
    text = text.replace("\n", "")

    lemmatizer = WordNetLemmatizer()

    # text = "".join([char for char in text if char not in string.punctuation])

    words = word_tokenize(text)
    # porter = PorterStemmer()
    lemmas = [lemmatizer.lemmatize(word).lower() for word in words]
    return " ".join(lemmas)


def pre_process(bug, system):
    all_sentences = []

    # --------------------------------
    title = bug["bug"]["title"]
    all_sentences.append(
        {
            "id": "0",
            "text": title["#text"],
            "prep_text": preprocess_text(title["#text"]),
            "labels": [title["@ob"], title["@eb"], title["@sr"]]
        }
    )
    # --------------------------------

    if "desc" in bug["bug"]:

        paragraphs = bug["bug"]["desc"]["parg"]
        if type(paragraphs) is not list:
            paragraphs = [paragraphs]

        for parag in paragraphs:
            sentences = parag["st"]
            if type(sentences) is not list:
                sentences = [sentences]

            for sentence in sentences:
                if "#text" not in sentence:
                    continue
                all_sentences.append(
                    {
                        "id": sentence["@id"],
                        "text": sentence["#text"],
                        "prep_text": preprocess_text(sentence["#text"]),
                        "labels": [sentence["@ob"], sentence["@eb"], sentence["@sr"]]
                    }
                )

    return {
        "system": system,
        "id": bug["bug"]["id"],
        "sentences": all_sentences,
    }


if __name__ == '__main__':
    data_path = r"C:\Users\ojcch\Documents\Repositories\projects\bee-tool\new_evaluation\data"
    output_path = "data_prep"

    Path(output_path).mkdir(parents=True, exist_ok=True)

    for _, dirs, _ in os.walk(data_path):
        for sys_name in dirs:
            all_bugs = read_files(os.path.join(data_path, sys_name))

            print(sys_name, len(all_bugs))

            prep_bugs = list(map(lambda x: pre_process(x, sys_name), all_bugs))

            utils.write_json_line_by_line(prep_bugs, os.path.join(output_path, f"{sys_name}.json.prep"))
