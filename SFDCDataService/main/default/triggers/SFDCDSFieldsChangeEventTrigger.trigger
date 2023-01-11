trigger SFDCDSFieldsChangeEventTrigger on SFDC_Data_Service_Fields__ChangeEvent (after insert) {
    System.debug('SFDCDSFieldsChangeEventTrigger...running...');
    Boolean DisableTriggersFlagPermission = FeatureManagement.checkPermission('DisableTriggersFlag');    
    SFDCDSFieldsEventTriggerHandler cceth = new SFDCDSFieldsEventTriggerHandler();
    if ( !DisableTriggersFlagPermission ) {
	    new SFDCDSFieldsEventTriggerHandler().run();
    }

}