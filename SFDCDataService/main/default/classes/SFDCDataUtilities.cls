public class SFDCDataUtilities {

    public SFDCDataUtilities(){
    }
    
    public String nullCheck ( SObject resultSet, String checkField, String defaultValue ) {
        String returnString = '';
        String objectName = 'SFDC_Data_Service_Fields__c';
        String fieldName =  checkField;
        
        if ( resultSet.get(checkField) == null ) {
            returnString = defaultValue;
        } else {
            Schema.DisplayType typeOf = Schema.getGlobalDescribe() // or Schema.SOAPType
                .get(objectName)
                .getDescribe()
                .fields
                .getMap()
                .get(fieldName)
                .getDescribe()
                .getType(); // or getSOAPType()
            System.debug('888.01.100-##############SFDCDataUtilities:nullCheck:typeOf: '+checkField+' is => '+typeOf+' value: '+resultSet.get(checkField));
            try {
                //String fieldValue = (String) acc.get(selectedField);
                returnString = String.valueOf(resultSet.get(checkField));
                /*
                switch on typeOf {
                    where 'Integer' {
                        returnString = String.valueOf(resultSet.get(checkField));
                    }
                    where 'Double' {
                        returnString = String.valueOf(resultSet.get(checkField));
                    }
                    where 'Date' {
                        returnString = String.valueOf(resultSet.get(checkField));
                    }
                    where 'DateTime' {
                        returnString = String.valueOf(resultSet.get(checkField));
                    } 
                    where else {
                        returnString = (String) resultSet.get(checkField);
                    }
                }*/
                System.debug('888.01.200-##############SFDCDataUtilities:nullCheck:setting actual value => '+returnString);
            } catch (NullPointerException npe ) {
                returnString = defaultValue;
                System.debug('888.01.300-##############SFDCDataUtilities:nullCheck:setting DEFAULT value => '+returnString);
            }
        }
        return returnString;
    }

}