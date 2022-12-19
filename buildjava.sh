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

export base='../'

rm -rf ./dest
mkdir ./dest
#pwd
#ls -al
#ls -al ./app/lib
#ls -al ./app

#read inpt
mkdir ./dest/lib
cp ./app/lib/*.* ./dest/lib
#ls -al ./app/src/main/java/endolabs/salesforce/bulkv2/*/*.java
#read inpt
cd ./dest

#ls -al ../app/src/main/java/endolabs/salesforce/bulkv2/*/*.java 
#read inpt
#ls -al ./lib
#read inpt 
#ls -al .
#pwd
#read inpt 

#javac -cp   ./:./dest/lib/*.jar:./app/build/classes/java/main/endolabs/salesforce/bulkv2/*:./app/build/classes/java/main/endolabs/salesforce/bulkv2/*/* -d ./app/dest ./app/src/main/java/endolabs/salesforce/bulkv2/*/*.java
javac -cp ./lib/json-simple-1.1.1.jar:./lib/slf4j-simple-1.6.2.jar:./lib/slf4j-api-1.7.32.jar:./lib/logging-interceptor-3.2.0.jar:./lib/okio-1.9.0.jar:./lib/okhttp-3.9.1.jar:./lib/jackson-core-2.12.3.jar:./lib/org.slf4j.jar:./lib/jackson-databind-2.13.0.jar:./lib/jackson-annotations-2.13.0.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java -d . ../app/src/main/java/endolabs/salesforce/bulkv2/*/*.java 
#javac -cp   ./:./lib/*.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java -d ../app ../app/src/main/java/endolabs/salesforce/bulkv2/*/*.java 
#ls -l ../app/*/*/*/*
read inpt

javac -cp './lib/json-simple-1.1.1.jar:./lib/slf4j-simple-1.6.2.jar:./lib/slf4j-api-1.7.32.jar:./lib/logging-interceptor-3.2.0.jar:./lib/okio-1.6.0.jar:./lib/okhttp-3.9.1.jar:./lib/jackson-core-2.12.3.jar:./lib/org.slf4j.jar:./lib/jackson-databind-2.13.0.jar:./lib/jackson-annotations-2.13.0.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java'  -d ./ ../app/src/main/java/endolabs/salesforce/bulkv2/*.java
#javac -cp '.:./lib/*.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java'  -d . ../app/src/main/java/endolabs/salesforce/bulkv2/*.java
echo "imports are built..."
ls -l ./*/*/*/*
#read inpt

javac -cp './lib/json-simple-1.1.1.jar:./lib/slf4j-simple-1.6.2.jar:./lib/slf4j-api-1.7.32.jar:./lib/logging-interceptor-3.2.0.jar:./lib/okio-1.6.0.jar:./lib/okhttp-3.9.1.jar:./lib/jackson-core-2.12.3.jar:./lib/org.slf4j.jar:./lib/jackson-databind-2.13.0.jar:./lib/jackson-annotations-2.13.0.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java'  -d ./ ../app/src/main/java/success/salesforce/bulkloadermain/utilities/DotEnv.java
#javac -cp '.:./lib/*.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java'  -d . ../app/src/main/java/success/salesforce/bulkloadermain/utilities/DotEnv.java
echo "utilities are built...x"
javac -cp './lib/json-simple-1.1.1.jar:./lib/slf4j-simple-1.6.2.jar:./lib/slf4j-api-1.7.32.jar:./lib/logging-interceptor-3.2.0.jar:./lib/okio-1.6.0.jar:./lib/okhttp-3.9.1.jar:./lib/jackson-core-2.12.3.jar:./lib/org.slf4j.jar:./lib/jackson-databind-2.13.0.jar:./lib/jackson-annotations-2.13.0.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java' -d ./ ../app/src/main/java/success/salesforce/bulkloadermain/BulkAPIv2Main.java
#javac -cp '.:./lib/*.jar:./endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:../app/src/main/java' -d . ../app/src/main/java/success/salesforce/bulkloadermain/BulkAPIv2Main.java
echo "main is built...y"
#ls -l ./*/*/*/*

if [ "$2" = "OLD" ]
then

    rm -rf ./SFDCDataUtility.jar
    jar -c -v -f ./SFDCDataUtility.jar -e success.salesforce.bulkloadermain.BulkAPIv2Main \
    ./lib/*.jar \
    ./endolabs/salesforce/bulkv2/*.class \
    ./endolabs/salesforce/bulkv2/*/*.class \
    ./success/salesforce/bulkloadermain/*.class \
    ./success/salesforce/bulkloadermain/*/*.class

    ls -al ./*.jar
else 
    echo "###############Building NEW version############"
    #cd .
    rm -rf ./SFDCDataUtility.jar
    jar -c -v -f ./SFDCDataUtility.jar -e success.salesforce.bulkloadermain.BulkAPIv2Main \
    ./lib/*.jar \
    ./endolabs/salesforce/bulkv2/*.class \
    ./endolabs/salesforce/bulkv2/*/*.class \
    ./success/salesforce/bulkloadermain/*.class \
    ./success/salesforce/bulkloadermain/*/*.class

    ls -al ./*.jar
    #cd ..
fi
#./sucess/salesforce/bulkloadermain/utilities/*.class \

#javac  -g -cp ./lib/\*:force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise:force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/sobject \
#     -sourcepath force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise:force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/sobject \
#      -d force-enterprise-api-master/target \
#      force-enterprise-api-master/src/main/java/com/sforce/soap/enterprise/sobject/*.java 

#javac -cp ./lib/\* salesforce_deploy/CICDDeployClient.java


#cd ./dest
if [ "$1" = "LIST" ]
then
    echo "enter the class you are looking for:"
    read inpt
    #FILES=./lib/*.jar
    FILES=./SFDCDataUtility.jar
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

