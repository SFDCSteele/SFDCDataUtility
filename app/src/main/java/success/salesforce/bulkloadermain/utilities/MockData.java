package success.salesforce.bulkloadermain.utilities;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.File;
import java.lang.StringBuffer;
import java.util.*;

public class MockData {

    List<String> fieldNames  = new ArrayList<String>();
    List<String> fieldFiller = new ArrayList<String>();
    List<String> fieldDefault = new ArrayList<String>();
    List<String> fieldAction = new ArrayList<String>();

    public MockData () {

        initializeData();

    }

    public String buildMock(int totalRecords) {
        int rowCount = 1;
        int validFields = 0;
        String outputBuffer = "";
        String outputField = "";
        String outputLine = "";
        try {
            //FileWriter myWriter = new FileWriter(pathName+"/"+inputName+".csv");
            FileWriter myWriter = new FileWriter("output_"+totalRecords+".csv");
            outputLine = "";
            
            for (int j=0; j<fieldAction.size(); j++ ) {
                if ( !fieldAction.get(j).equals("SKIP")) {
                    validFields++;
                }
            }
            System.out.println(">>>>>>>>>>>>>################ valid fields: "+validFields);
            for (int i=0,k=0; i<fieldNames.size(); i++ ) {
                if ( !fieldAction.get(i).equals("SKIP")) {
                    //if ( i < (fieldNames.size()-1) ) {
                    if ( ++k < validFields ) {
                        //outputLine += "\""+fieldNames.get(i)+"\""+",";
                        outputLine += fieldNames.get(i)+",";
                    } else {
                        //outputLine += "\""+fieldNames.get(i)+"\"";
                        outputLine += fieldNames.get(i);
                    }    
                }
                //outputLine += fieldNames.get(i)+",";
                //outputLine += "\""+fieldNames.get(i)+"\"";
            }
            outputLine += "\n";
            outputBuffer += outputLine;
            //System.out.println(""+(rowCount+1)+"-"+outputLine);
            myWriter.write(outputLine);
            for (rowCount=0; rowCount<totalRecords; rowCount++) {
                outputLine = "";
                for (int i=0,k=0; i<fieldNames.size(); i++ ) {
                    outputField = "";
                    if ( !fieldAction.get(i).equals("SKIP")) {
                        if ( fieldFiller.get(i).equals("BLAMK")) {
                            outputField = "";
                        } else if ( fieldFiller.get(i).equals("DEFAULT")) {
                            outputField = fieldDefault.get(i);
                        } else if ( fieldFiller.get(i).equals("MOCKED")) {
                            outputField = fieldDefault.get(i);
                            //String replaceString=s1.replaceAll("a","e")
                            outputField = outputField.replaceAll("#",""+(rowCount+1));
                            outputField = outputField.replaceAll("&",""+totalRecords);
                            //System.out.println("mocked field: "+outputField);
                        }
                        if ( fieldAction.get(i).equals("QUOTED")) {
                            outputField = "\""+outputField+"\"";
                        }            
                        //System.out.println(""+(i+1)+"-"+fieldNames.get(i)+"\t\t=\t"+outputField);
                        if ( ++k < validFields ) {
                            outputLine += outputField+",";
                        } else {
                            outputLine += outputField;
                        }
                    }
                }
                outputLine += "\n";
                outputBuffer += outputLine;
                //System.out.println(""+(rowCount+1)+"-"+outputLine);
                myWriter.write(outputLine);
            //System.out.println(""+rowCount+"-"+outputLine);
            }
            //writeFile(outputLine);
            myWriter.close();
            //System.out.println("Successfully wrote to the file: "+pathName+"/"+inputName+".csv");
            //return true;
        } catch (IOException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
            //return false;
        }
        return outputBuffer;
    }
    /*
    private boolean writeFile (StringBuffer outputData) {

        try {
            //FileWriter myWriter = new FileWriter(pathName+"/"+inputName+".csv");
            FileWriter myWriter = new FileWriter("output.csv");
            myWriter.write(outputData);
            myWriter.close();
            //System.out.println("Successfully wrote to the file: "+pathName+"/"+inputName+".csv");
            return true;
          } catch (IOException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
            return false;
          }
          */
          /*
    try {
            final BufferedWriter writer = new BufferedWriter(new FileWriter("output.csv"));
            writer.write(outputData+"\n");
            writer.close();
        } catch (final JSONException je) {
            je.printStackTrace();
       }*/
    //}


    private void initializeData () {

        /*
        fieldNames  = new ArrayList<>(Arrays.asList("Id","IsDeleted","MasterRecordId","Name","LastName","FirstName","Salutation","MiddleName","Suffix","Type","RecordTypeId","ParentId","BillingStreet","BillingCity","BillingState","BillingPostalCode","BillingCountry","BillingLatitude","BillingLongitude","BillingGeocodeAccuracy","BillingAddress","ShippingStreet","ShippingCity","ShippingState","ShippingPostalCode","ShippingCountry","ShippingLatitude","ShippingLongitude","ShippingGeocodeAccuracy","ShippingAddress","Phone","Fax","AccountNumber","Website","PhotoUrl","Sic","Industry","AnnualRevenue","NumberOfEmployees","Ownership","TickerSymbol","Description","Rating","Site","OwnerId","CreatedDate","CreatedById","LastModifiedDate","LastModifiedById","SystemModstamp","LastActivityDate","LastViewedDate","LastReferencedDate","IsActive","EffectiveDate","EndDate","SourceSystemIdentifier","SourceSystemModifiedDate","PersonContactId","IsPersonAccount","PersonMailingStreet","PersonMailingCity","PersonMailingState","PersonMailingPostalCode","PersonMailingCountry","PersonMailingLatitude","PersonMailingLongitude","PersonMailingGeocodeAccuracy","PersonMailingAddress","PersonMobilePhone","PersonHomePhone","PersonEmail","PersonTitle","PersonDepartment","PersonBirthdate","PersonLastCURequestDate","PersonLastCUUpdateDate","PersonEmailBouncedReason","PersonEmailBouncedDate","PersonIndividualId","PersonMaritalStatus","PersonGender","PersonDeceasedDate","PersonSequenceInMultipleBirth","Jigsaw","JigsawCompanyId","AccountSource","SicDesc","OperatingHoursId","HealthCloudGA__Active__c","HealthCloudGA__CarePlan__c","HealthCloudGA__Disabled__c","HealthCloudGA__EnrollmentType__c","HealthCloudGA__IndividualId__c","HealthCloudGA__IndividualType__c","HealthCloudGA__Institution__c","HealthCloudGA__LowIncome__c","HealthCloudGA__MedicaidEligibilityStatus__c","HealthCloudGA__MedicalRecordNumber__c","HealthCloudGA__MedicareEnrollee__c","HealthCloudGA__OREC__c","HealthCloudGA__PayerType__c","HealthCloudGA__PrimaryContact__c","HealthCloudGA__SourceSystemId__c","HealthCloudGA__SourceSystem__c","HealthCloudGA__TaxId__c","cern__HiIsActive__c","cern__HiMatchKey__c","cern__HiPopulationId__c","cern__HiTenantId__c","cern__HiUniqueId__c","cern__RecordTypeDeveloperName__c","VCC_Facility_Type__c","VCC_Mailing_different_from_Billing__c","VCC_Station_ID__c","VCC_Date_Patient_Verified__c","VCC_Latest_Call_Date__c","VCC_Veteran_Demographic_Alert__c","VCC_Veteran_Phone_Address_Verified__c","SSN_Last_4_Digits__c","VCC_Gender_Identity__c","cern__HiCohortId__c","SSN_Search__c","VCC_Primary_Facility__c","HealthCloudGA__Age__pc","HealthCloudGA__BirthDate__pc","HealthCloudGA__ConditionStatus__pc","HealthCloudGA__ConvertedReferrals__pc","HealthCloudGA__CountryOfBirth__pc","HealthCloudGA__CreatedFromLead__pc","HealthCloudGA__DeceasedDate__pc","HealthCloudGA__Gender__pc","HealthCloudGA__IndividualId__pc","HealthCloudGA__IndividualType__pc","HealthCloudGA__MedicalRecordNumber__pc","HealthCloudGA__Monitored_at_Home__pc","HealthCloudGA__PreferredName__pc","HealthCloudGA__PrimaryLanguage__pc","HealthCloudGA__ReferrerScore__pc","HealthCloudGA__SecondaryLanguage__pc","HealthCloudGA__SourceSystemId__pc","HealthCloudGA__SourceSystem__pc","HealthCloudGA__StatusGroup__pc","HealthCloudGA__Testing_Status__pc","HealthCloudGA__TotalReferrals__pc","cern__BestContactTime__pc","cern__CommunicationPreference__pc","cern__HiBusinessPhone__pc","cern__HiEthnicity__pc","cern__HiIsActive__pc","cern__HiIsDeceased__pc","cern__HiLanguage1__pc","cern__HiLanguage2__pc","cern__HiMaritalStatus__pc","cern__HiMatchKey__pc","cern__HiPopulationId__pc","cern__HiPrefix__pc","cern__HiRace__pc","cern__HiReligion__pc","cern__HiTenantId__pc","cern__HiUniqueId__pc","VCC_Date_of_Birth_Text__pc","VCC_Dual_Registration__pc","VCC_Emergency_Contact_Phone__pc","VCC_Emergency_Contact__pc","VCC_Enrolled__pc","VCC_MVI_External_Id__pc","VCC_Means_Test__pc","VCC_Member_ID__pc","VCC_Next_of_Kin_Phone__pc","VCC_Next_of_Kin__pc","VCC_Preferred_Gender_of_MSA__pc","VCC_Primary_Registered_Facility__pc","VCC_Priority_Group__pc","VCC_Secondary_Registered_Facility__pc","VCC_Service_Connected__pc","VCC_Suffix__pc","VCC_Telecare_Capable__pc","VCC_Temp_End_Date__pc","VCC_Temp_Notes__pc","VCC_Temp_Phone__pc","VCC_Temp_Start_Date__pc","cern__HiBirthSex__pc","VCC_Primary_Caregiver_Phone__pc","VCC_Primary_Caregiver__pc","VCC_Temp_Phone_End_Date__pc","VCC_Temp_Phone_Notes__pc","VCC_Temp_Phone_Start_Date__pc","VCC_Work_Phone__pc","vccProviderLoginSiteCode__pc","egaincrm__Languages__pc","egaincrm__Level__pc"));
        fieldFiller  = new ArrayList<>(Arrays.asList("BLANK","DEFAULT","BLANK","MOCKED","MOCKED","MOCKED","BLANK","MOCKED","BLANK","BLANK","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","DEFAULT","BLANK","BLANK","BLANK","MOCKED","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","DEFAULT","BLANK","BLANK","BLANK","BLANK","MOCKED","DEFAULT","MOCKED","DEFAULT","DEFAULT","DEFAULT","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","MOCKED","BLANK","BLANK","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","DEFAULT","DEFAULT","MOCKED","DEFAULT","DEFAULT","DEFAULT","DEFAULT","BLANK","BLANK","BLANK","BLANK","DEFAULT","DEFAULT","DEFAULT","BLANK","DEFAULT","DEFAULT","DEFAULT","DEFAULT","DEFAULT","DEFAULT","BLANK","DEFAULT","BLANK","BLANK","BLANK","DEFAULT","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","DEFAULT","DEFAULT","BLANK","BLANK","DEFAULT","DEFAULT","BLANK","DEFAULT","DEFAULT","DEFAULT","BLANK","BLANK","BLANK","DEFAULT","BLANK","DEFAULT","DEFAULT","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","DEFAULT","DEFAULT","BLANK","BLANK","BLANK","DEFAULT","DEFAULT","BLANK","BLANK","BLANK","DEFAULT","DEFAULT","BLANK","DEFAULT","BLANK","BLANK","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","DEFAULT","BLANK","DEFAULT","BLANK","BLANK","BLANK","BLANK","DEFAULT","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK"));
        fieldDefault  = new ArrayList<>(Arrays.asList("BLANK","FALSE","BLANK","&_Person# Smith#","Smith#","Person#","BLANK","M#","BLANK","BLANK","0123d0000004JLKAA2","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","(111)111-1122","BLANK","BLANK","BLANK","/services/images/photo/#","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","0053S000000IzGkQAK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","FALSE","BLANK","BLANK","BLANK","BLANK","0033S000002qNTnQAM#","TRUE","# Maple Avenue","Anytown","MD","99999-2233","UNITED STATES","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","fakeemail#@fake.com","BLANK","BLANK","2/6/55","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","FALSE","NonDual","0013S000003mKACQ#","Individual","FALSE","FALSE","FALSE","BLANK","BLANK","BLANK","BLANK","0033S000002qNTnQAM","921d0afb-48a6-4798-9676-195cb439e79b","db3994d7-5c1b-450e-b495-aabacea6e4ab","BLANK","TRUE","0013S000003mKACQA2","c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6","db3994d7-5c1b-450e-b495-aabacea6e4ab","921d0afb-48a6-4798-9676-195cb439e79b","PersonAccount","BLANK","FALSE","BLANK","BLANK","BLANK","Verify Veteran Insurance","Primary Phone & Address are correct","FALSE","BLANK","BLANK","BLANK","BLANK","BLANK","52 Years","12-Jan-55","BLANK","BLANK","United States","FALSE","BLANK","Male","0013S000003mKACQA21637170576139","Individual","BLANK","BLANK","BLANK","English","","English","921d0afb-48a6-4798-9676-195cb439e79b","db3994d7-5c1b-450e-b495-aabacea6e4ab","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","TRUE","FALSE","BLANK","BLANK","BLANK","0013S000003mKACQA2","c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6","BLANK","BLANK","BLANK","db3994d7-5c1b-450e-b495-aabacea6e4ab","921d0afb-48a6-4798-9676-195cb439e79b","BLANK","FALSE","BLANK","BLANK","FALSE","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","FALSE","BLANK","FALSE","BLANK","BLANK","BLANK","BLANK","Male","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK","BLANK"));
        fieldAction  = new ArrayList<>(Arrays.asList("NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","QUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED"));
        */
        //                                             Id,          Name,             cern__HiUniqueId__c                                     RecordTypeId,        Phone,                                                                             PersonMailingStreet,  PersonMailingCity,  PersonMailingState,  PersonMailingPostalCode,  PersonMailingCountry,  PersonEmail,          PersonBirthdate,  HealthCloudGA__IndividualId__c,                                     HealthCloudGA__IndividualType__c,  HealthCloudGA__PrimaryContact__c,  HealthCloudGA__SourceSystemId__c,      HealthCloudGA__SourceSystem__c,        HealthCloudGA__TaxId__c,  cern__HiIsActive__c,  cern__HiMatchKey__c,  cern__HiPopulationId__c,               cern__HiTenantId__c,                   cern__HiUniqueId__c,                   cern__RecordTypeDeveloperName__c,                                                                                                                              HealthCloudGA__CountryOfBirth__pc,  HealthCloudGA__Gender__pc,                                    HealthCloudGA__IndividualType__pc,  HealthCloudGA__PrimaryLanguage__pc,  HealthCloudGA__SecondaryLanguage__pc,  HealthCloudGA__SourceSystemId__pc,     HealthCloudGA__SourceSystem__pc,       cern__HiIsActive__pc,  cern__HiIsDeceased__pc,  cern__HiMatchKey__pc,  cern__HiPopulationId__pc,              cern__HiTenantId__pc,                  cern__HiUniqueId__pc,                  VCC_Dual_Registration__pc,  VCC_Enrolled__pc,  VCC_Service_Connected__pc,  VCC_Suffix__pc,  VCC_Telecare_Capable__pc,  VCC_Temp_End_Date__pc,  VCC_Temp_Notes__pc,  VCC_Temp_Phone__pc,  VCC_Temp_Start_Date__pc,  cern__HiBirthSex__pc   HealthCloudGA__PreferredName__c
        fieldNames  = new ArrayList<>(Arrays.asList(  "Id",        "Name",           "cern__HiUniqueId__c","LastName","FirstName","MiddleName","RecordTypeId",      "Phone",        "PhotoUrl",                "PersonContactId",    "IsPersonAccount","PersonMailingStreet","PersonMailingCity","PersonMailingState","PersonMailingPostalCode","PersonMailingCountry","PersonEmail",        "PersonBirthdate","HealthCloudGA__EnrollmentType__c","HealthCloudGA__IndividualId__c","HealthCloudGA__IndividualType__c","HealthCloudGA__PrimaryContact__c","HealthCloudGA__SourceSystemId__c",    "HealthCloudGA__SourceSystem__c",      "HealthCloudGA__TaxId__c","cern__HiIsActive__c","cern__HiMatchKey__c","cern__HiPopulationId__c",             "cern__HiTenantId__c",                 "cern__HiUniqueId__c",                 "cern__RecordTypeDeveloperName__c","VCC_Veteran_Demographic_Alert__c",                                 "HealthCloudGA__Age__pc","HealthCloudGA__BirthDate__pc","HealthCloudGA__CountryOfBirth__pc","HealthCloudGA__Gender__pc","HealthCloudGA__IndividualId__pc","HealthCloudGA__IndividualType__pc","HealthCloudGA__PrimaryLanguage__pc","HealthCloudGA__SecondaryLanguage__pc","HealthCloudGA__SourceSystemId__pc",   "HealthCloudGA__SourceSystem__pc",     "cern__HiIsActive__pc","cern__HiIsDeceased__pc","cern__HiMatchKey__pc","cern__HiPopulationId__pc",            "cern__HiTenantId__pc",                "cern__HiUniqueId__pc",                "VCC_Dual_Registration__pc","VCC_Enrolled__pc","VCC_Service_Connected__pc","VCC_Suffix__pc","VCC_Telecare_Capable__pc","VCC_Temp_End_Date__pc","VCC_Temp_Notes__pc","VCC_Temp_Phone__pc","VCC_Temp_Start_Date__pc","cern__HiBirthSex__pc","Description"));
        fieldFiller  = new ArrayList<>(Arrays.asList( "BLANK",    "MOCKED",          "MOCKED",               "MOCKED",  "MOCKED",   "MOCKED",    "DEFAULT",           "DEFAULT",      "MOCKED",                  "MOCKED",             "DEFAULT",        "MOCKED",             "DEFAULT",          "DEFAULT",           "DEFAULT",                "DEFAULT",             "MOCKED",             "DEFAULT",        "DEFAULT",                         "MOCKED",                        "DEFAULT",                         "DEFAULT",                         "DEFAULT",                             "DEFAULT",                             "BLANK",                  "DEFAULT",            "DEFAULT",            "DEFAULT",                             "DEFAULT",                             "DEFAULT",                             "DEFAULT",                         "DEFAULT",                                                          "DEFAULT",               "MOCKED",                      "DEFAULT",                          "DEFAULT",                  "DEFAULT",                        "DEFAULT",                          "DEFAULT",                           "DEFAULT",                             "DEFAULT",                             "DEFAULT",                             "DEFAULT",             "DEFAULT",               "DEFAULT",             "DEFAULT",                             "DEFAULT",                             "DEFAULT",                             "DEFAULT",                  "DEFAULT",         "DEFAULT",                  "BLANK",         "DEFAULT",                 "BLANK",                "BLANK",             "BLANK",             "BLANK",                  "DEFAULT",             "DEFAULT"));
        fieldDefault  = new ArrayList<>(Arrays.asList("BLANK",    "&_Person# Smith#","&_Person# Smith#",   "Smith#",  "&_Person#",  "M#",        "0123d0000004LaKAAU","(111)111-1122","/services/images/photo/#","0033S000002qNTnQAM#","TRUE",           "# Maple Avenue",     "Anytown",          "MD",                "99999-2233",             "UNITED STATES",       "fakeemail#@fake.com","1955-02-06",     "NonDual",                         "0013S000003mKACQ#",             "Individual",                      "0033S000002qNTnQAM",              "921d0afb-48a6-4798-9676-195cb439e79b","db3994d7-5c1b-450e-b495-aabacea6e4ab","BLANK",                  "TRUE",               "0013S000003mKACQA2", "c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6","db3994d7-5c1b-450e-b495-aabacea6e4ab","921d0afb-48a6-4798-9676-195cb439e79b","PersonAccount",                   "\"Verify Veteran Insurance, Primary Phone & Address are correct\"","# Years",               "1955-02-06",                  "United States",                    "Male",                     "0013S000003mKACQA21637170576139","Individual",                       "English",                           "English",                             "921d0afb-48a6-4798-9676-195cb439e79b","db3994d7-5c1b-450e-b495-aabacea6e4ab","TRUE",                "FALSE",                 "0013S000003mKACQA2",  "c7ccb8d9-bd41-4e87-93ed-9d9b6bea31b6","db3994d7-5c1b-450e-b495-aabacea6e4ab","921d0afb-48a6-4798-9676-195cb439e79b","FALSE",                    "FALSE",           "FALSE",                    "BLANK",         "FALSE",                   "BLANK",                "BLANK",             "BLANK",             "BLANK",                  "Male",              "Bulk API Upsert"));
        fieldAction  = new ArrayList<>(Arrays.asList( "SKIP",     "SKIP",            "NOTQUOTED",          "NOTQUOTED","NOTQUOTED","NOTQUOTED","NOTQUOTED",         "NOTQUOTED",    "SKIP",                    "SKIP",               "SKIP",           "NOTQUOTED",          "NOTQUOTED",        "NOTQUOTED",         "NOTQUOTED",              "NOTQUOTED",           "NOTQUOTED",          "NOTQUOTED",       "NOTQUOTED",                       "SKIP",                          "NOTQUOTED",                       "SKIP",                            "SKIP",                                "SKIP",                                "SKIP",                   "SKIP",               "SKIP",               "SKIP",                                "SKIP",                                "SKIP",                                "NOTQUOTED",                      "SKIP",                                                             "SKIP",                  "SKIP",                   "NOTQUOTED",                        "NOTQUOTED",                "SKIP",                           "NOTQUOTED",                             "NOTQUOTED",                              "NOTQUOTED",                                "SKIP",                                "SKIP",                                "NOTQUOTED",                "SKIP",                  "SKIP",                "SKIP",                                "SKIP",                                "SKIP",                                "SKIP",                     "SKIP",            "SKIP",                     "SKIP",          "SKIP",                    "SKIP",                 "SKIP",              "SKIP",              "SKIP",    "NOTQUOTED",           "NOTQUOTED"));
        
    }
    
}
