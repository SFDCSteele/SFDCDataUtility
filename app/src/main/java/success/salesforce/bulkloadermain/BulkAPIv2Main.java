/*
 * This Java source file was generated by the Gradle 'init' task.
 */
package success.salesforce.bulkloadermain;

import java.io.IOException;
import java.io.BufferedReader;
import java.lang.InterruptedException;
import java.util.*;

import java.util.concurrent.TimeUnit;

import success.salesforce.bulkloadermain.utilities.*;

import endolabs.salesforce.bulkv2.*;
import endolabs.salesforce.bulkv2.request.*;
import endolabs.salesforce.bulkv2.response.*;
import endolabs.salesforce.bulkv2.type.*;

public class BulkAPIv2Main {

        
    //String log_dir = System.getProperty("log_dir","/tmp/log");
    DotEnv vars = new DotEnv();
    Map<String, String> env = new HashMap<>();
    MockData mock = new MockData();
    LoadCSVData csvData = new LoadCSVData();

    public BulkAPIv2Main () {
    }

    public BulkAPIv2Main (String[] args) {
        System.out.println("Inside constructor...");
        System.out.println("Working Directory = " + System.getProperty("user.dir"));
        env = vars.loadVars(".env");
        System.out.println("Using system variables: \n"+
            "========================================"+
            "========================================"+
            "========================================"+
            "========================================"
        );
        for (String envName : env.keySet()) {
            System.out.format("\t\t%s\t\t=\t\t%s%n",
                              envName,
                              env.get(envName));
        }
        //if (args[0] == "MOCK" ) {
        //mock.buildMock(Integer.parseInt(env.get("mockRecords")));
        //} else {
            //String csv = mock.buildMock(Integer.parseInt(env.get("mockRecords")));

            execute (env);
        //}

    }

    public String getGreeting() {
        return "BulkAPIv2Main says Hello World!";
    }

    public static void main(String[] args) {
        System.out.println(new BulkAPIv2Main().getGreeting());
        new BulkAPIv2Main(args);

    }

    private boolean execute (Map<String,String> env) {
        boolean executionStatus = false;
        String  csv = "";
        OperationEnum requestedOperation = OperationEnum.INSERT;
        //System.out.println("\n\ninside execute...customerKey: "+env.get("customerKey"));

        try {
            Bulk2Client client = new Bulk2ClientBuilder()
            .withPassword(env.get("customerKey"), env.get("consumerSecret"), env.get("username"), env.get("password"))
            .useSandbox()
            .useCustomURL(env.get("customURL"))
            .build(); 

            if ( (env.get("operation")).equals("insert")) {
                requestedOperation = OperationEnum.INSERT;
            } else if ( (env.get("operation")).equals("upsert")) {
                requestedOperation = OperationEnum.UPSERT;
            }

            CreateJobResponse createJobResponse = client.createJob(env.get("object"),requestedOperation);
            String jobId = createJobResponse.getId();
            
            if ( (env.get("operation")).equals("upsert")) {
                //createJobResponse.setExternalIdFieldName(env.get("externalIdFieldName"));
                //csv = csvData.returnCSVData(env.get("csvFolder"),env.get("csvFile"));
                csv = mock.buildMock(Integer.parseInt(env.get("mockRecords")));
                /*"Id,cern__HiUniqueId__c\n"+
                "001BZ000002yYk7YAE,80000_Person1 M1 Smith1\n"+
                "001BZ000002yYk8YAE,80000_Person2 M2 Smith2\n"+
                "001BZ000002yYk9YAE,80000_Person3 M3 Smith3\n"+
                "001BZ000002yYkAYAU,80000_Person4 M4 Smith4\n"+
                "001BZ000002yYkBYAU,80000_Person5 M5 Smith5\n"+
                "001BZ000002yYkCYAU,80000_Person6 M6 Smith6\n"+
                "001BZ000002yYkDYAU,80000_Person7 M7 Smith7\n"+
                "001BZ000002yYkEYAU,80000_Person8 M8 Smith8\n"+
                "001BZ000002yYkFYAU,80000_Person9 M9 Smith9\n";*/
                
            } else {
                csv = mock.buildMock(Integer.parseInt(env.get("mockRecords")));
            }

            /*String csv2 = "Id,Name,RecordTypeId,Phone,PersonMailingStreet,PersonMailingCity,PersonMailingState,PersonMailingPostalCode,PersonMailingCountry,PersonEmail,PersonBirthdate,HealthCloudGA__IndividualId__c,HealthCloudGA__IndividualType__c,HealthCloudGA__PrimaryContact__c,HealthCloudGA__SourceSystemId__c,HealthCloudGA__SourceSystem__c,HealthCloudGA__TaxId__c,cern__HiIsActive__c,cern__HiMatchKey__c,cern__HiPopulationId__c,cern__HiTenantId__c,cern__HiUniqueId__c,cern__RecordTypeDeveloperName__c,HealthCloudGA__CountryOfBirth__pc,HealthCloudGA__Gender__pc,HealthCloudGA__IndividualType__pc,HealthCloudGA__PrimaryLanguage__pc,HealthCloudGA__SecondaryLanguage__pc,HealthCloudGA__SourceSystemId__pc,HealthCloudGA__SourceSystem__pc,cern__HiIsActive__pc,cern__HiIsDeceased__pc,cern__HiMatchKey__pc,cern__HiPopulationId__pc,cern__HiTenantId__pc,cern__HiUniqueId__pc,VCC_Dual_Registration__pc,VCC_Enrolled__pc,VCC_Service_Connected__pc,VCC_Suffix__pc,VCC_Telecare_Capable__pc,VCC_Temp_End_Date__pc,VCC_Temp_Notes__pc,VCC_Temp_Phone__pc,VCC_Temp_Start_Date__pc,cern__HiBirthSex__pc\n" +
            ",5_Person1 Smith1,0123d0000004JJrAAM,(111)111-1122,1 Maple Avenue,Anytown,MD,99999-2233,UNITED STATES,fakeemail1@fake.com,1955-02-06,0013S000003mKACQ1,Individual,0033S000002qNTnQAM,,,,TRUE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,PersonAccount,\"Verify Veteran Insurance\",United States,Male,Individual,English,English,,,TRUE,FALSE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,FALSE,FALSE,,FALSE,,,,,FALSE\n" +
            ",5_Person2 Smith2,M2,0123d0000004JJrAAM,(111)111-1122,2 Maple Avenue,Anytown,MD,99999-2233,UNITED STATES,fakeemail2@fake.com,1955-02-06,0013S000003mKACQ2,Individual,0033S000002qNTnQAM,,,,TRUE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,PersonAccount,\"Verify Veteran Insurance\",United States,Male,Individual,English,English,,,TRUE,FALSE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,FALSE,FALSE,,FALSE,,,,,FALSE\n" +
            ",5_Person3 Smith3,0123d0000004JJrAAM,(111)111-1122,3 Maple Avenue,Anytown,MD,99999-2233,UNITED STATES,fakeemail3@fake.com,1955-02-06,0013S000003mKACQ3,Individual,0033S000002qNTnQAM,,,,TRUE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,PersonAccount,\"Verify Veteran Insurance\",United States,Male,Individual,English,English,,,TRUE,FALSE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,FALSE,FALSE,,FALSE,,,,,FALSE\n" +
            ",5_Person4 Smith4,0123d0000004JJrAAM,(111)111-1122,4 Maple Avenue,Anytown,MD,99999-2233,UNITED STATES,fakeemail4@fake.com,1955-02-06,0013S000003mKACQ4,Individual,0033S000002qNTnQAM,,,,TRUE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,PersonAccount,\"Verify Veteran Insurance\",United States,Male,Individual,English,English,,,TRUE,FALSE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,FALSE,FALSE,,FALSE,,,,,FALSE\n" +
            ",5_Person5 Smith5,0123d0000004JJrAAM,(111)111-1122,5 Maple Avenue,Anytown,MD,99999-2233,UNITED STATES,fakeemail5@fake.com,1955-02-06,0013S000003mKACQ5,Individual,0033S000002qNTnQAM,,,,TRUE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,PersonAccount,\"Verify Veteran Insurance\",United States,Male,Individual,English,English,,,TRUE,FALSE,0013S000003mKACQA2,c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6,,,FALSE,FALSE,,FALSE,,,,,FALSE\n";
            */
            /*"Name,Description,NumberOfEmployees\n" +
                    "BulkAPIv2Main TestAccount1,Description of TestAccount1,30\n" +
                    "BulkAPIv2Main TestAccount2,Another description,40\n" +
                    "BulkAPIv2Main TestAccount3,Yet another description,50";*/
            client.uploadJobData(jobId, csv);
            
            // When using a separate request to upload data, make sure to close the job
            JobInfo closeJobResponse = client.closeJob(jobId);
            
            while (true) {
                TimeUnit.SECONDS.sleep(1);
            
                GetJobInfoResponse jobInfo = client.getJobInfo(jobId);
                if (jobInfo.isFinished()) {
                    break;
                }
            }
            //Get Job Successful Record Results ( Bulk2Client#getJobSuccessfulRecordResults )
            //Get Job Failed Record Results ( Bulk2Client#getJobFailedRecordResults )
            //Get Job Unprocessed Record Results ( Bulk2Client#getJobUnprocessedRecordResults )
            try (BufferedReader reader = new BufferedReader(client.getJobSuccessfulRecordResults(jobId))) {
                reader.lines().forEach(System.out::println);
            }
            try (BufferedReader reader = new BufferedReader(client.getJobFailedRecordResults(jobId))) {
                reader.lines().forEach(System.out::println);
            }    
        } catch (final IOException ioe) {
            System.out.println("BulkAPI execution failure: "+ioe.getMessage());
        } catch (final InterruptedException inte) {
            System.out.println("BulkAPI interrupt failure: "+inte.getMessage());
        }




        return executionStatus;

    }

}
