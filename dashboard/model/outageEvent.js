const pool = require('../db');

class OutageEvent {
    static getOutagesByFeederNameAndDate(feederName, date, callback) {
      const sql = `
        SELECT *
        FROM FederDataNew
        WHERE Feeder_Name = ? AND Date = ?
      `;
      pool.query(sql, [feederName, date], (err, results) => {
        if (err) {
          return callback(err);
        }
        callback(null, results);
      });
    }



    static calculateOutageDuration(outageEvents) {
        let totalDuration = 0;
        let firstBreathTime = null;
      
        // Sort events by Meter_Number and Alarm_Time to ensure proper pairing
        outageEvents.sort((a, b) => {
          // Sort primarily by Meter_Number
          if (a.Meter_Number !== b.Meter_Number) {
            return a.Meter_Number - b.Meter_Number;
          }
          // If Meter_Numbers are the same, sort by Alarm_Time
          return new Date(a.Alarm_Time) - new Date(b.Alarm_Time);
        });
      
        // Iterate through sorted events to calculate outage durations
        for (let i = 0; i < outageEvents.length; i++) {
          const event = outageEvents[i];
      
          if (event.Alarm_Type === 'METER_LAST_GASP') {
            // Record last gasp time
            const lastGaspTime = new Date(event.Alarm_Time);
      
            // Find corresponding METER_FIRST_BREATH event
            let foundMatch = false;
            for (let j = i + 1; j < outageEvents.length; j++) {
              const nextEvent = outageEvents[j];
              if (nextEvent.Meter_Number === event.Meter_Number && nextEvent.Alarm_Type === 'METER_FIRST_BREATH') {
                firstBreathTime = new Date(nextEvent.Alarm_Time);
                const durationMs = firstBreathTime - lastGaspTime ;
                totalDuration += durationMs;
                foundMatch = true;
                i = j; // Move i to j to skip this matched pair in the next iteration
                break;
              }
            }
      
            // If no match found for METER_LAST_GASP, skip to next
            if (!foundMatch) {
              continue;
            }
          }
        }
      
        return totalDuration; // Duration in milliseconds
      }
      
   
      

   
    
}
    module.exports = OutageEvent;


    

