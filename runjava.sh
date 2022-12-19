clear
if [ "$1" = "BUILD" ]
then
    ./buildjava.sh $1
fi

##
#export envName=UAT
#export CI_BUILD_URL=https://app.codeship.com/projects/304537/builds/41494671
#export CI_BUILD_ID=41494703
#export CI_STATUS=Initiated
##export CI_STATUS=Success
#export CI_NAME=codeship/TESTING 
#export CI_REPO_NAME=department-of-veterans-affairs/va-salesforce-master
#export CI_COMMIT_ID=1e79be6f14c98da0cb5e3d81a3c32d07818d422a
#export CI_MESSAGE="added Package.xml for ENH-000586"
#export CI_MESSAGE="Merge pull request #1042 from department-of-veterans-affairs/Release_19.6.1

#Deploy Release_19.6.1 to Staging"
#export CI_COMMITTER_NAME="John Preniczky"
#export CI_BRANCH="VIEWS-ENH-000586"

#java -cp ./lib/\*:. salesforce_rest.CICDRestClient buildStatus
#java -cp ./lib/\*:. salesforce_rest.CICDRestClientV2  getSandboxName VAHD-ENH-000699
#java -cp ./lib/\*:. utility.DataUtil  executeBuild /Users/williamsteele/documents/salesforce/VA/VAwork/deployments/work/repo-Release_20.02.1/src/build/Releases/Release_20.02.1/Package_VAHRS-ENH-000880.xml
#Yesterday, Last_Week, Last_n_Days:5
#java -cp ./lib/\*:. utility.DataUtil  extractLogs  Yesterday
#java -cp ./lib/\*:. utility.DataUtil  extractLogs  Last_Week
#java -cp './dest:./lib/logging-interceptor-3.2.0.jar:./lib/okio-1.9.0.jar:./lib/okhttp-3.9.1.jar:./lib/jackson-core-2.12.3.jar:./lib/org.slf4j.jar:./lib/jackson-databind-2.13.0.jar:./lib/jackson-annotations-2.13.0.jar:./dest/endolabs/salesforce/bulkv2/request/CloseOrAbortJobRequest:./src/main/java'  BulkLoaderMain.BulkAPIv2Main
#java -cp './dest:./app/dest/success/bulkloadermain:./app/lib/slf4j-simple-1.6.2.jar:./app/lib/slf4j-api-1.7.32.jar:./app/lib/logging-interceptor-3.2.0.jar:./app/lib/okio-1.3.0.jar:./app/lib/okhttp-3.9.1.jar:./app/lib/jackson-core-2.12.3.jar:./app/lib/org.slf4j.jar:./app/lib/jackson-databind-2.13.0.jar:./app/lib/jackson-annotations-2.13.0.jar'  success.salesforce.bulkloadermain.BulkAPIv2Main
#java -cp './dest:./app/dest/success/bulkloadermain:./app/lib/*.jar:./app/lib/postgresql-42.5.0.jar:./app/lib/json-simple-1.1.1.jar'  success.salesforce.bulkloadermain.BulkAPIv2Main
#java -cp ./app/dest/SFDCDataUtility.jar  dest.success.salesforce.bulkloadermain.BulkAPIv2Main
cd ./dest
ls -al
#java -jar ./dest/SFDCDataUtility.jar -cp ./dest/lib/*.jar
java -cp ./lib/*.jar:./lib/json-simple-1.1.1.jar -jar SFDCDataUtility.jar 
#