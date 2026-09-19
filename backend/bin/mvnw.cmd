@ECHO OFF
SETLOCAL
SET "BASE_DIR=%~dp0"
SET "MAVEN_VERSION=3.9.11"
SET "MAVEN_DIR=%BASE_DIR%.mvn\apache-maven-%MAVEN_VERSION%"
IF EXIST "%MAVEN_DIR%\bin\mvn.cmd" GOTO runMaven
IF NOT EXIST "%BASE_DIR%.mvn" MKDIR "%BASE_DIR%.mvn"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile '%BASE_DIR%.mvn\apache-maven-%MAVEN_VERSION%-bin.zip'"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Force '%BASE_DIR%.mvn\apache-maven-%MAVEN_VERSION%-bin.zip' '%BASE_DIR%.mvn'"
DEL "%BASE_DIR%.mvn\apache-maven-%MAVEN_VERSION%-bin.zip"
:runMaven
CALL "%MAVEN_DIR%\bin\mvn.cmd" %*
