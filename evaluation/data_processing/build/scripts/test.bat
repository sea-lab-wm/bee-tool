@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  test startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%..

@rem Add default JVM options here. You can also use JAVA_OPTS and TEST_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS=

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto init

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto init

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:init
@rem Get command-line arguments, handling Windows variants

if not "%OS%" == "Windows_NT" goto win9xME_args

:win9xME_args
@rem Slurp the command line arguments.
set CMD_LINE_ARGS=
set _SKIP=2

:win9xME_args_slurp
if "x%~1" == "x" goto execute

set CMD_LINE_ARGS=%*

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\lib\test-1.0.jar;%APP_HOME%\lib\text-analyzer-1.2.jar;%APP_HOME%\lib\stanford-corenlp-3.8.0.jar;%APP_HOME%\lib\stanford-corenlp-3.8.0-models.jar;%APP_HOME%\lib\appcore-1.1.jar;%APP_HOME%\lib\commons-lang3-3.6.jar;%APP_HOME%\lib\AppleJavaExtensions-1.4.jar;%APP_HOME%\lib\jollyday-0.4.9.jar;%APP_HOME%\lib\lucene-queryparser-4.10.3.jar;%APP_HOME%\lib\lucene-analyzers-common-4.10.3.jar;%APP_HOME%\lib\lucene-queries-4.10.3.jar;%APP_HOME%\lib\lucene-core-4.10.3.jar;%APP_HOME%\lib\javax.servlet-api-3.0.1.jar;%APP_HOME%\lib\xom-1.2.10.jar;%APP_HOME%\lib\joda-time-2.9.4.jar;%APP_HOME%\lib\ejml-0.23.jar;%APP_HOME%\lib\javax.json-1.0.4.jar;%APP_HOME%\lib\slf4j-log4j12-1.7.25.jar;%APP_HOME%\lib\slf4j-api-1.7.25.jar;%APP_HOME%\lib\protobuf-java-3.2.0.jar;%APP_HOME%\lib\commons-io-2.5.jar;%APP_HOME%\lib\junit-4.12.jar;%APP_HOME%\lib\google-http-client-1.22.0.jar;%APP_HOME%\lib\simplecsv-2.1.jar;%APP_HOME%\lib\commons-cli-1.4.jar;%APP_HOME%\lib\jaxb-api-2.2.7.jar;%APP_HOME%\lib\lucene-sandbox-4.10.3.jar;%APP_HOME%\lib\xercesImpl-2.8.0.jar;%APP_HOME%\lib\xalan-2.7.0.jar;%APP_HOME%\lib\log4j-1.2.17.jar;%APP_HOME%\lib\hamcrest-core-1.3.jar;%APP_HOME%\lib\jsr305-1.3.9.jar;%APP_HOME%\lib\httpclient-4.0.1.jar;%APP_HOME%\lib\httpcore-4.0.1.jar;%APP_HOME%\lib\commons-logging-1.1.1.jar;%APP_HOME%\lib\commons-codec-1.3.jar

@rem Execute test
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %TEST_OPTS%  -classpath "%CLASSPATH%" Main %CMD_LINE_ARGS%

:end
@rem End local scope for the variables with windows NT shell
if "%ERRORLEVEL%"=="0" goto mainEnd

:fail
rem Set variable TEST_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
if  not "" == "%TEST_EXIT_CONSOLE%" exit 1
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
