package success.salesforce.bulkloadermain.utilities;


import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.*;


public class LoadCSVData {


    public LoadCSVData () {
    }

    public String returnCSVData (String csvFolder, String csvFileName ) {
        String returnCSVData = "";
        String line          = "";

        try {

            System.out.println("attempting to open file: "+csvFolder+"/"+csvFileName);
            final FileReader fileReader = new FileReader(csvFolder+"/"+csvFileName);
            final BufferedReader bufferedReader = new BufferedReader(fileReader);

            while ((line = bufferedReader.readLine()) != null) {
                //System.out.println("reading line: "+line);
                returnCSVData +=line+"\n";

            }
            bufferedReader.close();

        } catch (FileNotFoundException fne) {
            System.out.println("Could not Open file: "+fne.getMessage());
        } catch (final IOException ioe) {
            System.out.println("Could not Read file: "+ioe.getMessage());
        }
        return returnCSVData;
    }
    
}
