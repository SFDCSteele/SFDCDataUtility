package success.salesforce.bulkloadermain.utilities;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.*;



public class DotEnv {

    public Map<String,String> loadVars ( String fileName ) {

        Map<String,String> returnMap = new HashMap<>();
        String line = "";


        try {
            final FileReader fileReader = new FileReader(fileName);
            final BufferedReader bufferedReader = new BufferedReader(fileReader);
            line = "";

            while ((line = bufferedReader.readLine()) != null) {
                //System.out.println("read .env file line: "+line+" length: "+line.length());
                //System.out.println("read .env file line: "+line+"\tsplit-0: "+line.split("=")[0]+
                //            " 1: "+line.split("=")[1]);
                if ( line.length() > 0 ) {
                    returnMap.put(line.split("=")[0],line.split("=")[1]);
                }
            }
            bufferedReader.close();

        } catch (final IOException ioe) {
            System.out.println("Could not Read environment file: "+ioe.getMessage());

        } catch (final java.lang.ArrayIndexOutOfBoundsException aoe) {
            System.out.println("Error while processing the environment file: "+aoe.getMessage());
        }
        return returnMap;

    }
    
}
