package success.salesforce.bulkloadermain.utilities;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.ResultSet;
import java.sql.Statement;
//import java.io.IOException;
//import java.io.BufferedReader;
//import java.io.FileReader;
//import java.util.*;

public class DatabaseConnection {

    //https://www.codejava.net/java-se/jdbc/connect-to-microsoft-sql-server-via-jdbc
    //postgres://postgres:C@thySt33l3!2022@localHost:5432/SteeleSnowball
    private final String url = "jdbc:postgresql://localhost:5432/SteeleSnowball";
    private final String user = "postgres";
    private final String password = "C@thySt33l3!2022";

    public DatabaseConnection () {
        System.out.println("\n\nInside DatabaseConnection constructor....");
    }
    
    public Connection connect() {
        Connection conn = null;
        Statement stmt = null;
        try {
            conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected to the PostgreSQL server successfully.");
            //const result = await client.query('SELECT debt_id,name,type,balance,interestRate,terms,payment,estimatedPayoffDate,status FROM debts')
            stmt = conn.createStatement();
            String sql = "SELECT \"UID\",\"accountName\",\"accountType\",\"balance\",\"accountTrend\",\"interestRate\","+
            "\"payment\",\"dueDay\",\"estimatedPayoffDate\",\"yearPaidOff\",\"accountStatus\" FROM accounts;";
            ResultSet rs = stmt.executeQuery( sql );
            while ( rs.next() ) {
                int id = rs.getInt("UID");
                String  name = rs.getString("accountName");
                String  type = rs.getString("accountType");
                //float balance = rs.getFloat("balance");
                String  trend = rs.getString("accountTrend");
                //float interestRate = rs.getFloat("interestRate");
                //float payment = rs.getFloat("payment");
                int dueDay  = rs.getInt("dueDay");
                System.out.println( "ID = " + id );
                System.out.println( "NAME = " + name );
                System.out.println( "type = " + type );
                //System.out.println( "balance = " + balance );
                System.out.println( "trend = " + trend );
                System.out.println();
             }
            //System.out.println("sql: "+sql+" results: "+rs.toString());
            //stmt.executeUpdate(sql);
            stmt.close();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return conn;
    }
    
}
