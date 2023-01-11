public class SFDCDSFieldsEventTriggerHandler extends ChangeEventTriggerHandler {
    
    
    // Map containing all the different change event types
    private Map<String, List<SFDC_Data_Service_Fields__ChangeEvent>> changeEvents;
    //this is a new method that could parse the events based on changetype, so each changeEvent could be processed differently
    public override void parseEventTypes() {
        System.debug('100.01->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:parseEventTypes:inside....');
        String changeType = '';
        List<SFDC_Data_Service_Fields__ChangeEvent> eventArr = new List<SFDC_Data_Service_Fields__ChangeEvent>();
        for(SFDC_Data_Service_Fields__ChangeEvent event : (List<SFDC_Data_Service_Fields__ChangeEvent>) Trigger.new) {
            EventBus.ChangeEventHeader header = event.ChangeEventHeader;
            System.debug('100.02->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:parseEventTypes:header:  '+header);
            
            if (changeEvents.isEmpty() || changeEvents.get(header.changetype) == null ) {
                eventArr = new List<SFDC_Data_Service_Fields__ChangeEvent>();
                eventArr.add(event);
                changeEvents.put(header.changetype,eventArr); 
            } else {
                eventArr = changeEvents.get(header.changetype);
                eventArr.add(event);
                changeEvents.put(header.changetype,eventArr); 
            }
            //if (header.changetype == 'CREATE') {
            //}
        }      
    }
    
    
    public override void processCreate(List<Id> IdsToProcess) {
        System.debug('101.01->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:processCreate:inside....IdsToProcess: '+IdsToProcess);
        processTransactions(IdsToProcess);
        
    }
    
    public override void processUpdate(List<Id> IdsToProcess) {
        System.debug('101.02-##############SFDCDSFieldsEvenentTriggerHandler:processUpdate:inside....IdsToProcess: '+IdsToProcess);
        
        processTransactions(IdsToProcess);
    }
    
    
    public override void processDelete(List<Id> IdsToProcess) {
        System.debug('101.03-##############SFDCDSFieldsEvenentTriggerHandler:processDelete:inside....IdsToProcess: '+IdsToProcess);
        
        processTransactions(IdsToProcess);
    }
    
    private void processTransactions(List<Id> IdsToProcess) {
        System.debug('777.04-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:Ids: '+IdsToProcess);
        
        SFDCDataUtilities utility = new SFDCDataUtilities();
        AUPJSONGenerator sJSonStr = new AUPJSONGenerator();
		List<SFDC_Data_Service_Fields__c> fldsUpdate = new List<SFDC_Data_Service_Fields__c>();
		List<SFDC_Data_Service_Fields__c> fldsDelete = new List<SFDC_Data_Service_Fields__c>();
        SFDC_Data_Service_Fields__c fldUpdate = new SFDC_Data_Service_Fields__c();
        SFDC_Meta_Data_Service fldProcessing = new SFDC_Meta_Data_Service();
        String statusCheck = '';
        String workType = '';
        String processingMessage = '';
        set<string> numberTypes = new Set<String>{'bigint'};
        
        for(SFDC_Data_Service_Fields__c flds: [SELECT Id, Name, Source_Table__c, SFDC_Data_Service_Object__c, Ordinal__c, Column_Name__c, Source_Length__c, 
                                               Source_Precision__c, API_Name__c, Label__c, Description__c, Type__c, Length__c, Field_Name__c, 
                                               Salesforce_Object__c, Status__c, Source_Data_Type__c, Source_Schema__c, Source_Database__c, 
                                               Integrations__c, Questions__c, Comments__c, Prefix_Identifier__c,Precision__c 
                                               FROM SFDC_Data_Service_Fields__c where Id =: IdsToProcess]){
            System.debug('777.05.100-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:SFDC_Data_Service_Object__c => '+
                         flds.SFDC_Data_Service_Object__c+' Name: '+flds.Name+
                         ' Column_Name: '+flds.Column_Name__c+' Status: '+flds.Status__c);
            fldUpdate = flds;//new SFDC_Data_Service_Fields__c();
            statusCheck = flds.Status__c;
            try {
                switch on statusCheck {
                   when 'Delete' {
                       fldsDelete.add(flds);
                   }
                   when 'Prepare' {
                        /*
                            {
                                "Id": "a0D4x00000XJ9fuEAD",
                                "Name": "SFF-0229",
                                "Source_Table__c": "RESOURCE",
                                "SFDC_Data_Service_Object__c": "a0C4x000008GbiCEAS",
                                "Ordinal__c": 13,
                                "Column_Name__c": "PostalCode",
                                "Source_Length__c": 60,
                                "Description__c": "CDC update: New",
                                "Type__c": "Text",
                                "Salesforce_Object__c": "User",
                                "Status__c": "Migrate",
                                "Source_Data_Type__c": "varchar",
                                "Source_Schema__c": "osc",
                                "Source_Database__c": "Salesforce",
                                "Prefix_Identifier__c": "SFArcB"
                            }|0x40097b83
							r.Plan_Date__c = date.parse('12/27/2015');
                        */
                       System.debug('777.05.105-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:statusCheck => '+statusCheck);
                       try {
                           if ( fldUpdate.API_Name__c == '.' ) {
                               fldUpdate.API_Name__c = fldUpdate.Prefix_Identifier__c+'_'+fldUpdate.Column_Name__c+'__c';
                           }
                           if ( fldUpdate.Label__c == '.' ) {
	                           fldUpdate.Label__c = utility.nullCheck ( flds,'Column_Name__c', 'NA' );
                           }
                           if ( fldUpdate.Description__c == '.' ) {
            	               fldUpdate.Description__c = utility.nullCheck ( flds,'Description__c', 'NA' ); 
                           }
                           if ( fldUpdate.Length__c == 0 ) {
    	                       fldUpdate.Length__c = Integer.valueOf(utility.nullCheck ( flds,'Source_Length__c', '0') );
                           }
                           if ( fldUpdate.Precision__c == 0 ) {
	                           fldUpdate.Precision__c = Double.valueOf(utility.nullCheck ( flds,'Source_Precision__c', '0') ); 
                           }
                           System.debug('777.05.105.1-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:fldUpdate.Type__c => '+fldUpdate.Type__c+
                                        ' numberTypes: '+numberTypes);
                           if ( fldUpdate.Type__c == 'Text' ) {
        	                   workType = utility.nullCheck ( flds,'Source_Data_Type__c', 'NA' );
                               if ( numberTypes.contains(workType) ) {
                                   System.debug('777.05.105.2-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:workType => '+workType+
                                                ' numberTypes: '+numberTypes);

                                   workType = 'Number';
                               } else if ( workType == 'date') {
                                   workType = 'Date';
                               } else if ( workType == 'datetime2') {
                                   workType = 'Date/Time';
                               } else if ( workType == 'bit') {
                                   workType = 'Checkbox';
                               } else if ( fldUpdate.Length__c > 255 ) {
                                   workType = 'Text Area';
                               } else {
                                   workType = 'Text';
                               } 
                               fldUpdate.Type__c = workType;
                           }
                           fldUpdate.Status__c = 'Migrate';
                       } catch (NullPointerException npe ) {
	                       System.debug('777.05.105.9-##############SFDCDSFieldsEvenentTriggerHandler:null pointer exception => '+npe.getMessage());
                       }
                       /*fldUpdate.Description__c = 'CDC update: '+statusCheck;
                       try {
                           fldUpdate.Label__c = fldUpdate.Column_Name__c;
                       } catch (DMLException dml ) {
	                       fldUpdate.Description__c = 'Label__c does not exist';
                       }
                       if ( fldUpdate.API_Name__c.length() <= 0 ) {
                           fldUpdate.API_Name__c = fldUpdate.Prefix_Identifier__c+'_'+fldUpdate.Column_Name__c+'__c';
                       }
                       fldUpdate.Type__c = fldUpdate.Source_Data_Type__c;
                       fldUpdate.Length__c = fldUpdate.Source_Length__c;*/
                       fldsUpdate.add(fldUpdate);
                       System.debug('777.05.106-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:fields ADDED to update => '+fldsUpdate.size());
                   }
                    when 'Createx' {
                        
                        SFDC_Data_Service_JSON fieldObject = new SFDC_Data_Service_JSON();
                        fieldObject.objectName = fldUpdate.Salesforce_Object__c;
                        fieldObject.fieldFullName = fldUpdate.Field_Name__c;
                        fieldObject.fieldLabel = fldUpdate.Label__c;
                        fieldObject.fieldType = fldUpdate.Type__c;
                        //fieldObject.fieldRelationshipLabel = fldUpdate. 
                        //fieldObject.fieldRelationshipName = fldUpdate. 
                        //fieldObject.fieldReferenceTo = fldUpdate. 
                        //fieldObject.fieldExternalId = fldUpdate. 
                        fieldObject.fieldLength = fldUpdate.Length__c.intValue();
                        //fieldObject.fieldVisibleLines = fldUpdate. 
                        //
                        processingMessage = fldProcessing.dispatcher(fldUpdate.Type__c, fieldObject);
                        if ( processingMessage == 'GOOD' ) {
                            fldUpdate.Processing_Messages__c = fldUpdate.SFDC_Data_Service_Object__r.Name+'.'+
																fldUpdate.API_Name__c+' created successfully!';
    	                    fldUpdate.Status__c = 'Active';
                        } else {
                            fldUpdate.Processing_Messages__c = processingMessage;
	                        fldUpdate.Status__c = 'Create Error';
                        }
                        
                        //fldUpdate.Description__c = 'CDC update: '+statusCheck;
                        //fldsUpdate.add(fldUpdate);
                    }
                   when else {
                       //fldUpdate.Description__c = 'CDC update: '+statusCheck;
                       fldsUpdate.add(fldUpdate);
                   }
                }
            } catch (Exception ex) {
                    System.debug('777.05.109-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:switch exception => '+ex.getMessage());
            }
            /*
                try {
                    for(SFDC_Data_Service_Fields__c parentGroup : [SELECT Id, Name, RecordTypeId, Parent_SFDC_Data_Service_Fields__c, SFDC_Data_Service_Fields__c, Status__c FROM SFDC_Data_Service_Fields__c where Id =: flds.Parent_SFDC_Data_Service_Fields__c]){
                        //parentGroupName = parentGroup.SFDC_Data_Service_Fields__c;
                        System.debug('777.05.110-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:SFDC_Data_Service_Fields__c => '+flds.SFDC_Data_Service_Fields__c+
                                     ' Parent Group Name: '+parentGroup.SFDC_Data_Service_Fields__c);
                        if ( parentGroup.Parent_SFDC_Data_Service_Fields__c != null ) {
                            applicationName = parentGroup.SFDC_Data_Service_Fields__c;
                            applicationLevelName = flds.SFDC_Data_Service_Fields__c;
                            assignmentFound = true;
                        }
                    }
                } catch (NullPointerException npe) {
                    System.debug('777.05.120-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:SFDC_Data_Service_Fields__c => '+flds.SFDC_Data_Service_Fields__c+
                                 ' Parent_SFDC_Data_Service_Fields__c: '+flds.Parent_SFDC_Data_Service_Fields__c+' IS NULL!');
                    
                }
				*/
            }
        if ( fldsUpdate.size() > 0 ) {
	        System.debug('777.05.120-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:fields to update => '+fldsUpdate.size());
            try {
	            upsert fldsUpdate;
            } catch (DmlException e) {
		        System.debug('777.05.888-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:update failed => '+e.getMessage());
            }
        }
        if ( fldsDelete.size() > 0 ) {
	        System.debug('777.05.130-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:fields to delete => '+fldsDelete.size());
            try {
                delete fldsDelete;
            } catch (DmlException e) {
		        System.debug('777.05.999-##############SFDCDSFieldsEvenentTriggerHandler:processTransactions:delete failed => '+e.getMessage());
            }
        }
    }


    //This method takes all of the events in Trigger.new and maps the record Ids based on change type
    //***this can't be in the Virtual handler as events are typed based on which object it is
    //-----it may be required required to pull in the object based on new critera where the field in question did not actually change
    //--------like the field in question didn't change, but the record type changed which now requires us to look at that field
    public override Map<String, List<Id>> getChangeEventIds () {
        System.debug('104.01->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:getChangeEventIds:inside....');
        Map<String, List<Id>> recordIds = new Map<String, List<Id>>();
        String changeType = '';
        Id recordId;
        List<Id> recordArr = new List<Id>();
        List<String> changedFields = new List<String>();
        //Set<String> caseIds = new Set<String>();
        
        for(SFDC_Data_Service_Fields__ChangeEvent event : (List<SFDC_Data_Service_Fields__ChangeEvent>) Trigger.new) {
            EventBus.ChangeEventHeader header = event.ChangeEventHeader;
            changedFields = header.getChangedFields();
            System.debug('104.02->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:getChangeEventIds:header: '+header+' changeType: '+header.changetype);
            System.debug('104.02.01->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:getChangeEventIds:changeType: '+header.changetype);
            System.debug('104.02.02->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:getChangeEventIds:changedFields: '+changedFields);
            
            if (recordIds.isEmpty() || recordIds.get(header.changetype) == null ) {
                // Get all Record Ids for this change and add to the set
                recordArr = new List<Id>();
                for (Id rId : header.recordIds) {
                    recordArr.add(rId);
                }
                //if ( changedFields.contains('Status__c') && event.get('Status__c') != 'New' ) {
                    System.debug('104.02.03->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:getChangeEventIds:Fields have changed: '+changedFields);
                    recordIds.put(header.changetype,recordArr); 
                //}
            } else {
                recordArr = recordIds.get(header.changetype);
                for (Id rId : header.recordIds) {
                    recordArr.add(rId);
                }
                //if ( changedFields.contains('Status__c') && event.get('Status__c') != 'New' ) {
                    System.debug('104.02.04->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:getChangeEventIds:Fields have changed: '+changedFields);
                    recordIds.put(header.changetype,recordArr); 
                //}
            }
            //now put them in an 'ALL' type
            if (recordIds.isEmpty() || recordIds.get('ALL') == null ) {
                recordArr = new List<Id>();
                for (Id rId : header.recordIds) {
                    recordArr.add(rId);
                }
                recordIds.put('ALL',recordArr); 
            } else {
                recordArr = recordIds.get('ALL');
                for (Id rId : header.recordIds) {
                    recordArr.add(rId);
                }
                recordIds.put('ALL',recordArr); 
            }
        }      
        System.debug('104.10->>>>>>>>>>>>SFDCDSFieldsEvenentTriggerHandler:getChangeEventIds:return recordIds: '+recordIds);
        return recordIds;
    }
    
}