import os
import string
from pathlib import Path

import nltk
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


def preprocess_text2(text):
    text = text.replace("\n", "")

    lemmatizer = WordNetLemmatizer()

    # text = "".join([char for char in text if char not in string.punctuation])

    words = word_tokenize(text)
    # porter = PorterStemmer()
    lemmas = [lemmatizer.lemmatize(word).lower() for word in words]
    non_punct_lemmas = [word for word in lemmas if word not in string.punctuation]
    if not non_punct_lemmas:
        return None
    return " ".join(non_punct_lemmas)


def get_grams(tagged_words, index):
    grams = list(map(lambda x: x[index], tagged_words))
    for i in range(len(tagged_words) - 1):
        grams.append("-".join([tagged_words[i][index] , tagged_words[i + 1][index]]))
    for i in range(len(tagged_words) - 2):
        grams.append("-".join([tagged_words[i][index] , tagged_words[i + 1][index], tagged_words[i + 2][index]]))
    return grams


def preprocess_text(text):
    words = word_tokenize(text)
    tagged = nltk.pos_tag(words)

    lemmatizer = WordNetLemmatizer()
    lemmas = [(lemmatizer.lemmatize(word[0]).lower(), word[1]) for word in tagged]
    non_punct_lemmas = [word for word in lemmas if word[0] not in string.punctuation]
    if not non_punct_lemmas:
        return None
    pos_grams = get_grams(non_punct_lemmas, 1)
    n_grams = get_grams(non_punct_lemmas, 0)
    return " ".join(pos_grams + n_grams)


def pre_process(bug, system):
    all_sentences = []

    # --------------------------------
    title = bug["bug"]["title"]
    prep_title = preprocess_text(title["#text"])
    if prep_title is not None:
        all_sentences.append(
            {
                "id": "0",
                "text": title["#text"],
                "prep_text": prep_title,
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
                prep_txt = preprocess_text(sentence["#text"])
                if prep_txt is not None:
                    all_sentences.append(
                        {
                            "id": sentence["@id"],
                            "text": sentence["#text"],
                            "prep_text": prep_txt,
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
    output_path = "data_prep3"

    Path(output_path).mkdir(parents=True, exist_ok=True)

    for _, dirs, _ in os.walk(data_path):
        for sys_name in dirs:
            all_bugs = read_files(os.path.join(data_path, sys_name))

            print(sys_name, len(all_bugs))

            prep_bugs = list(map(lambda x: pre_process(x, sys_name), all_bugs))

            utils.write_json_line_by_line(prep_bugs, os.path.join(output_path, f"{sys_name}.json.prep"))
