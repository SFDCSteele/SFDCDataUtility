public with sharing class SFDC_Meta_Data_Service {
    
    private ApexPages.StandardSetController standardSetController;
    
    public SFDC_Meta_Data_Service() {
        
    }
    
    
    public SFDC_Meta_Data_Service(ApexPages.StandardSetController standardSetController)
    {
        this.standardSetController = standardSetController;
    }
    
    public PageReference doSomething()
    {
        // Apex code for handling records from a List View goes here
        List<SFDC_Data_Service_Fields__c> listViewRecords =
            (List<SFDC_Data_Service_Fields__c>) standardSetController.getRecords();
        
        //for(SFDC_Data_Service_Fields__c fields : listViewRecords) {
        //    System.debug('record: '+fields.id);
        
        
        List<SFDC_Data_Service_Fields__c> selectedListViewRecords =
            (List<SFDC_Data_Service_Fields__c>) standardSetController.getSelected();
        Boolean hasMore = standardSetController.getHasNext();
        System.debug('selectedListViewRecords: '+selectedListViewRecords);
            
        return null;
    }

    public PageReference processRecords () 
    {
        SFDCDataUtilities utility = new SFDCDataUtilities();
        List<SFDC_Data_Service_Fields__c> fldsUpdate = new List<SFDC_Data_Service_Fields__c>();
        SFDC_Data_Service_Fields__c fldUpdate = new SFDC_Data_Service_Fields__c();
        SFDC_Meta_Data_Service fldProcessing = new SFDC_Meta_Data_Service();
        String workType = '';
        String processingMessage = '';
        set<string> numberTypes = new Set<String>{'bigint'};
            
            for(SFDC_Data_Service_Fields__c flds: [SELECT Id, Name, Source_Table__c, SFDC_Data_Service_Object__c, Ordinal__c, Column_Name__c, Source_Length__c, 
                                                   Source_Precision__c, API_Name__c, Label__c, Description__c, Type__c, Length__c, Field_Name__c, 
                                                   Salesforce_Object__c, Status__c, Source_Data_Type__c, Source_Schema__c, Source_Database__c, 
                                                   Integrations__c, Questions__c, Comments__c, Prefix_Identifier__c,Precision__c, Scale__c ,
                                                   PickList_Values__c  
                                                   FROM SFDC_Data_Service_Fields__c where Status__c='Create']) {
                                                       
                                                       fldUpdate = flds;
                                                       System.debug('100.01.100-##############processTransactions:SFDC_Data_Service_Object__c => '+
                                                                    fldUpdate.SFDC_Data_Service_Object__c+' Name: '+fldUpdate.Name+
                                                                    ' fldUpdate.Field_Name__c: '+fldUpdate.Field_Name__c+
                                                                    ' API_Name__c: '+fldUpdate.API_Name__c+' Label__c: '+fldUpdate.Label__c+
                                                                    ' precision: '+fldUpdate.Precision__c+' scale: '+fldUpdate.Scale__c+
                                                                    ' Description__c: '+fldUpdate.Description__c+
                                                                    ' Column_Name: '+fldUpdate.Column_Name__c+' Status: '+fldUpdate.Status__c);
                                                       
                                                       try {
                                                           SFDC_Data_Service_JSON fieldObject = new SFDC_Data_Service_JSON();
                                                           fieldObject.objectName = fldUpdate.Salesforce_Object__c;
                                                           if ( fldUpdate.API_Name__c.contains('.') ) {
 	                                                          fieldObject.fieldFullName = fldUpdate.API_Name__c;//Field_Name__c;
                                                           } else {
                                                               fieldObject.fieldFullName = fldUpdate.Salesforce_Object__c+'.'+fldUpdate.API_Name__c;                                                           
                                                           }
                                                           fieldObject.fieldLabel = fldUpdate.Label__c;
                                                           fieldObject.fieldDescription = fldUpdate.Description__c;
                                                           fieldObject.fieldType = fldUpdate.Type__c;
                                                            
                                                           fieldObject.fieldPrecision = fldUpdate.Precision__c.intValue();
                                                           fieldObject.fieldScale = fldUpdate.Scale__c.intValue();
                                                           //fieldObject.fieldRelationshipLabel = fldUpdate. 
                                                           //fieldObject.fieldRelationshipName = fldUpdate. 
                                                           //fieldObject.fieldReferenceTo = fldUpdate. 
                                                           //fieldObject.fieldExternalId = fldUpdate. 
                                                           fieldObject.fieldLength = fldUpdate.Length__c.intValue();
                                                           fieldObject.fieldPickListValues = fldUpdate.PickList_Values__c;
                                                           //fieldObject.fieldVisibleLines = fldUpdate. 
                                                           //
                                                       System.debug('100.01.105-##############processTransactions:SFDC_Data_Service_Object__c => '+
                                                                    flds.SFDC_Data_Service_Object__c+' Type: '+fldUpdate.Type__c+
                                                                    ' fieldObject: '+fieldObject+' API_Name__c: '+fldUpdate.API_Name__c);
                                                           processingMessage = fldProcessing.dispatcher(fldUpdate.Type__c, fieldObject);
                                                       System.debug('100.01.106-##############processTransactions:SFDC_Data_Service_Object__c => '+
                                                                    ' processingMessage: '+processingMessage);
                                                           if ( processingMessage == 'GOOD' ) {
                                                               fldUpdate.Processing_Messages__c = fldUpdate.SFDC_Data_Service_Object__c+'.'+
                                                                   fldUpdate.API_Name__c+' created successfully!';
                                                               fldUpdate.Status__c = 'Active';
                                                           } else {
                                                               fldUpdate.Processing_Messages__c = processingMessage;
                                                               fldUpdate.Status__c = 'Create Error';
                                                           }
                                                           
                                                           //fldUpdate.Description__c = 'CDC update: '+statusCheck;
                                                           //fldsUpdate.add(fldUpdate);
                                                         //fldUpdate.Status__c = 'Migrate';

                                                       } catch (Exception ex) {
                                                           System.debug('100.10.109-##############processRecords:field creation exception => '+ex.getMessage());
                                                               fldUpdate.Processing_Messages__c = '100.10.109-##############processRecords:field creation exception => '+ex.getMessage();
                                                               fldUpdate.Status__c = 'Create Error';
                                                       }
                       fldsUpdate.add(fldUpdate);
                                                   }
        if ( fldsUpdate.size() > 0 ) {
            System.debug('100.10.120-##############processRecords:fields to update => '+fldsUpdate.size());
            try {
                upsert fldsUpdate;
            } catch (DmlException e) {
                System.debug('100.10.888-##############processRecords:update failed => '+e.getMessage());
            }
        }
        listView();
        return null;
    }
    public PageReference listView() {

    return new ApexPages.Action('{!List}').invoke();
    //System.PageReference[/a09?fcf=00B24000004cfLK]

	}
    
    public String dispatcher (String actionType, SFDC_Data_Service_JSON jsonToDisptach ) {
        String actionResult = 'GOOD';
        
        switch on actionType {
            when 'Lookup' {
                actionResult = createLookupField (jsonToDisptach);
            }
            when 'Number' {
                actionResult = createNumberField (jsonToDisptach);
            }
            when 'Checkbox' {
                actionResult = createCheckBoxField (jsonToDisptach);
            }
            when 'Currency' {
            }
            when 'Date' {
                actionResult = createDateField (jsonToDisptach);
            }
            when 'Date/Time' {
                actionResult = createDateTimeField (jsonToDisptach);
            }
            when 'Email' {
            }
            when 'Geolocation' {
            }
            when 'Percent' {
            }
            when 'Phone' {
            }
            when 'Picklist' {
            }
            when 'Picklist-Multi' {
            }
            when 'Text' {
                actionResult = createTextField (jsonToDisptach);
            }
            when 'Text Area' {
                actionResult = createTextAreaField (jsonToDisptach);
            }
            when 'Text Area Long' {
                actionResult = createTextAreaLongField (jsonToDisptach);
            }
            when 'Text Area Rich' {
                actionResult = createTextAreaLongField (jsonToDisptach);
            }
            when 'Text Encrypted' {
            }
            when 'Time' {
            }
            when 'URL' {
            }
            when else {		  // default block, optional
                // code block 4
            }
        }
        
        return actionResult;
    }
    
    public String createLookupField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = jsonObject.fieldType;
        customField.relationshipLabel = jsonObject.fieldRelationshipLabel;
        customField.relationshipName = jsonObject.fieldRelationshipName;
        customField.referenceTo = jsonObject.fieldReferenceTo;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createExternalField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = jsonObject.fieldType;
        customField.length = jsonObject.fieldLength;
        customField.externalId = jsonObject.fieldExternalId;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createTextAreaField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = 'TextArea';//jsonObject.fieldType;
        //customField.length = jsonObject.fieldLength;
        //customField.visibleLines = 3;
        //customField.length = 1;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createTextAreaLongField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;//LongTextAreaField__c';
        customField.label = jsonObject.fieldLabel;//'Long Text Area Field';
        customField.description = jsonObject.fieldDescription;
        customField.type_x = 'LongTextArea';
        customField.length = jsonObject.fieldLength;
        customField.visibleLines = 3;
        //customField.length = jsonObject.fieldLength;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createTextField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = jsonObject.fieldType;
        customField.description = jsonObject.fieldDescription;
        customField.length = jsonObject.fieldLength;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createDateField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = 'Date';
        customField.description = jsonObject.fieldDescription;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createDateTimeField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = 'DateTime';
        customField.description = jsonObject.fieldDescription;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createNumberField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = jsonObject.fieldType;
        customField.precision = jsonObject.fieldPrecision;
        customField.scale = jsonObject.fieldScale;
        System.debug('100.01.220-##############processTransactions:customField => '+
                     customField+' Scale: '+jsonObject.fieldScale);
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createCheckBoxField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = jsonObject.fieldType;
        customField.defaultValue = jsonObject.fieldDefaultValue;
        List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    public String createPicklistField(SFDC_Data_Service_JSON jsonObject)
    {
        MetadataService.MetadataPort service = createService();
        MetadataService.CustomField customField = new MetadataService.CustomField();
        customField.fullName = jsonObject.fieldFullName;
        customField.label = jsonObject.fieldLabel;
        customField.description = jsonObject.fieldDescription;
        customField.type_x = jsonObject.fieldType;
        metadataservice.Picklist pt = new metadataservice.Picklist();
        pt.sorted= false;
        metadataservice.PicklistValue one = new metadataservice.PicklistValue();
        one.fullName= 'first';
        one.default_x=false ;
        pt.picklistValues = new List<MetadataService.PicklistValue>{one};
            //customField.picklist = pt ;
            List<MetadataService.SaveResult> results =
            service.createMetadata(
                new MetadataService.Metadata[] { customField });
        return handleSaveResults(results[0]);
    }
    
    
    /**
* Example helper method to interpret a SaveResult, throws an exception if errors are found
**/
    public String handleSaveResults(MetadataService.SaveResult saveResult)
    {
        String actionResult = 'GOOD';
        // Nothing to see?
        if(saveResult==null || saveResult.success)
            return actionResult;
        // Construct error message and throw an exception
        if(saveResult.errors!=null)
        {
            List<String> messages = new List<String>();
            messages.add(
                (saveResult.errors.size()==1 ? 'Error ' : 'Errors ') +
                'occured processing component ' + saveResult.fullName + '.');
            for(MetadataService.Error error : saveResult.errors)
                messages.add(
                    error.message + ' (' + error.statusCode + ').' +
                    ( error.fields!=null && error.fields.size()>0 ?
                     ' Fields ' + String.join(error.fields, ',') + '.' : '' ) );
            if(messages.size()>0) {
                //throw new MetadataServiceExamplesException(String.join(messages, ' '));
                return String.join(messages, ' ');
            }
        }
        if(!saveResult.success) {
            //throw new MetadataServiceExamplesException('Request failed with no specified error.');
            return 'Request failed with no specified error.';
        }
        return actionResult;
    }
    /**
* Example helper method to interpret a SaveResult, throws an exception if errors are found
**/
    public String handleDeleteResults(MetadataService.DeleteResult deleteResult)
    {
        String actionResult = 'GOOD';
        // Nothing to see?
        if(deleteResult==null || deleteResult.success)
            return actionResult;
        // Construct error message and throw an exception
        if(deleteResult.errors!=null)
        {
            List<String> messages = new List<String>();
            messages.add(
                (deleteResult.errors.size()==1 ? 'Error ' : 'Errors ') +
                'occured processing component ' + deleteResult.fullName + '.');
            for(MetadataService.Error error : deleteResult.errors)
                messages.add(
                    error.message + ' (' + error.statusCode + ').' +
                    ( error.fields!=null && error.fields.size()>0 ?
                     ' Fields ' + String.join(error.fields, ',') + '.' : '' ) );
            if(messages.size()>0) {
                //throw new MetadataServiceExamplesException(String.join(messages, ' '));
                return String.join(messages, ' ');
            }
        }
        if(!deleteResult.success) {
            //throw new MetadataServiceExamplesException('Request failed with no specified error.');
            return 'Request failed with no specified error.';
        }
        return actionResult;
    }
    
    public class MetadataServiceExamplesException extends Exception { }
    
    public static MetadataService.MetadataPort createService()
    {
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();
        service.SessionHeader = new MetadataService.SessionHeader_element();
        service.SessionHeader.sessionId = UserInfo.getSessionId();
        return service;
    }
    
    /**
* Example helper method to interpret a UpsertResult, throws an exception if errors are found
**/
    public String handleUpsertResults(MetadataService.UpsertResult upsertResult)
    {
        String actionResult = 'GOOD';
        // Nothing to see?
        if(upsertResult==null || upsertResult.success)
            return actionResult;
        // Construct error message and throw an exception
        if(upsertResult.errors!=null)
        {
            List<String> messages = new List<String>();
            messages.add(
                (upsertResult.errors.size()==1 ? 'Error ' : 'Errors ') +
                'occured processing component ' + upsertResult.fullName + '.');
            for(MetadataService.Error error : upsertResult.errors)
                messages.add(
                    error.message + ' (' + error.statusCode + ').' +
                    ( error.fields!=null && error.fields.size()>0 ?
                     ' Fields ' + String.join(error.fields, ',') + '.' : '' ) );
            if(messages.size()>0) {
                //throw new MetadataServiceExamplesException(String.join(messages, ' '));
                return String.join(messages, ' ');
            }
        }
        if(!upsertResult.success) {
            //throw new MetadataServiceExamplesException('Request failed with no specified error.');
            return 'Request failed with no specified error.';
        }
        return actionResult;
    }
}