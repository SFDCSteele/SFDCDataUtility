package success.salesforce.bulkloadermain.utilities;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Iterator;
import java.util.ArrayList;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class Configuration {

    JSONObject jsonObject = new JSONObject();
    public String dbURL = "";
    public String dataSources = "";
    public ArrayList<String> sourceTables = new ArrayList<String>();

    public Configuration () {
        System.out.println("\n\nInside Configuration constructor....");
    }
    
    public JSONObject loadConfig() {
        JSONParser parser = new JSONParser();

        try {     
            Object obj = parser.parse(new FileReader("./app/resources/configuration.json"));

            jsonObject =  (JSONObject) obj;

            dbURL = (String) jsonObject.get("dbURL");
            System.out.println(dbURL);

            dataSources = (String) jsonObject.get("dataSources");
            System.out.println(dataSources);

            sourceTables = (JSONArray) jsonObject.get("sourceTables");
            System.out.println(sourceTables);

            // loop array
            Iterator<String> iterator = sourceTables.iterator();
            while (iterator.hasNext()) {
             System.out.println(iterator.next());
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return jsonObject;
    }
}
