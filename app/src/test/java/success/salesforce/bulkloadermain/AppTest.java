/*
 * This Java source file was generated by the Gradle 'init' task.
 */
package success.salesforce.bulkloadermain;

import org.junit.Test;
import static org.junit.Assert.*;

public class AppTest {
    @Test public void appHasAGreeting() {
        BulkAPIv2Main classUnderTest = new BulkAPIv2Main();
        assertNotNull("app should have a greeting", classUnderTest.getGreeting());
    }
}