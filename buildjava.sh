#!/bin/bash
clear

#javac -cp ./lib/\* force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/sobject/*.java
#javac -cp ./lib/\* force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/*.java


#javac -cp ./lib/\* force-enterprise-api-master/src/test/java/GenerateSourceFromWSDL.java
#javac -cp ./lib/\* salesforce_rest/CICDRestClient.java
#javac -cp ./lib/\* salesforce_rest/CICDRestClientV2.java
#javac -cp ./lib/\* salesforce_rest/AppConnection.java
#javac -cp ./lib/\* salesforce_rest/DataUtil.java

#sudo xattr -c /users/williamsteele/salesforce/VAwork/jdk-16.0.1/lib/server/classes.jsa
#sudo xattr -c /users/williamsteele/downloads/jdk-16.0.1/lib/server/classes.jsa
#sudo xattr -c /Users/williamsteele/iCloud/Salesforce/va2/vawork/jdk-16.0.1/lib/server/classes.jsa


rm -rf ./app/dest
mkdir ./app/dest
#ls -al ./app/src/main/java/endolabs/salesforce/bulkv2/*/*.java
#read inpt

#javac -cp   ./:./app/lib/*.jar:./app/build/classes/java/main/endolabs/salesforce/bulkv2/*:./app/build/classes/java/main/endolabs/salesforce/bulkv2/*/* -d ./app/dest ./app/src/main/java/endolabs/salesforce/bulkv2/*/*.java
javac -cp   ./app/lib/json-simple-1.1.1.jar:./app/lib/slf4j-simple-1.6.2.jar:./app/lib/slf4j-api-1.7.32.jar:./app/lib/logging-interceptor-3.2.0.jar:./app/lib/okio-1.9.0.jar:./app/lib/okhttp-3.9.1.jar:./app/lib/jackson-core-2.12.3.jar:./app/lib/org.slf4j.jar:./app/lib/jackson-databind-2.13.0.jar:./app/lib/jackson-annotations-2.13.0.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java -d ./app/dest ./app/src/main/java/endolabs/salesforce/bulkv2/*/*.java 
#javac -cp   ./:./app/lib/*.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java -d ./app/dest ./app/src/main/java/endolabs/salesforce/bulkv2/*/*.java 
ls -l ./app/dest/*/*/*/*
#read inpt

javac -cp './app/lib/json-simple-1.1.1.jar:./app/lib/slf4j-simple-1.6.2.jar:./app/lib/slf4j-api-1.7.32.jar:./app/lib/logging-interceptor-3.2.0.jar:./app/lib/okio-1.6.0.jar:./app/lib/okhttp-3.9.1.jar:./app/lib/jackson-core-2.12.3.jar:./app/lib/org.slf4j.jar:./app/lib/jackson-databind-2.13.0.jar:./app/lib/jackson-annotations-2.13.0.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java'  -d ./dest ./app/src/main/java/endolabs/salesforce/bulkv2/*.java
#javac -cp '.:./app/lib/*.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java'  -d ./dest ./app/src/main/java/endolabs/salesforce/bulkv2/*.java
echo "imports are built..."
ls -l ./dest/*/*/*/*
#read inpt

javac -cp './app/lib/json-simple-1.1.1.jar:./app/lib/slf4j-simple-1.6.2.jar:./app/lib/slf4j-api-1.7.32.jar:./app/lib/logging-interceptor-3.2.0.jar:./app/lib/okio-1.6.0.jar:./app/lib/okhttp-3.9.1.jar:./app/lib/jackson-core-2.12.3.jar:./app/lib/org.slf4j.jar:./app/lib/jackson-databind-2.13.0.jar:./app/lib/jackson-annotations-2.13.0.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java'  -d ./dest ./app/src/main/java/success/salesforce/bulkloadermain/utilities/DotEnv.java
#javac -cp '.:./app/lib/*.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java'  -d ./dest ./app/src/main/java/success/salesforce/bulkloadermain/utilities/DotEnv.java
echo "utilities are built...x"
javac -cp './app/lib/json-simple-1.1.1.jar:./app/lib/slf4j-simple-1.6.2.jar:./app/lib/slf4j-api-1.7.32.jar:./app/lib/logging-interceptor-3.2.0.jar:./app/lib/okio-1.6.0.jar:./app/lib/okhttp-3.9.1.jar:./app/lib/jackson-core-2.12.3.jar:./app/lib/org.slf4j.jar:./app/lib/jackson-databind-2.13.0.jar:./app/lib/jackson-annotations-2.13.0.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java' -d ./dest ./app/src/main/java/success/salesforce/bulkloadermain/BulkAPIv2Main.java
#javac -cp '.:./app/lib/*.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./app/src/main/java' -d ./dest ./app/src/main/java/success/salesforce/bulkloadermain/BulkAPIv2Main.java
echo "main is built...y"
#ls -l ./dest/*/*/*/*


#javac  -g -cp ./lib/\*:force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise:force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/sobject \
#     -sourcepath force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise:force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/sobject \
#      -d force-enterprise-api-master/target \
#      force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/sobject/*.java 

#javac -cp ./lib/\* salesforce_deploy/CICDDeployClient.java



if [ "$1" = "LIST" ]
then
    echo "enter the class you are looking for:"
    read inpt
    FILES=./lib/*.jar
    for f in $FILES
    do
    echo "Processing $f file..."
    # take action on each file. $f store current file name
    #ls -al $f
    jar -tf $f 
    #| grep $inpt
    echo "---------------------"
    echo "press return to continue"
    read inpt
    done
fi

ls -al
echo "Build complete-press return to continue..."
read inpt

