// Dispatch reference data — Florida Sheriff/PBSO-style 10-codes, signals, and a sample radio directory.
// Common-use set; admins can extend later via DB. Keep human-readable.

export interface CodeEntry {
  code: string;
  name: string;
  description: string;
  category?: string;
}

export interface RadioContact {
  callsign: string;
  unit: string;
  channel: string;
  notes?: string;
}

export const TEN_CODES: CodeEntry[] = [
  { code: "10-1", name: "Receiving Poorly", description: "Signal weak or unreadable.", category: "Radio" },
  { code: "10-2", name: "Receiving Well", description: "Signal good, loud and clear.", category: "Radio" },
  { code: "10-4", name: "Acknowledged", description: "Message received and understood.", category: "Radio" },
  { code: "10-5", name: "Relay", description: "Relay this message to another unit.", category: "Radio" },
  { code: "10-6", name: "Busy", description: "Stand by unless urgent.", category: "Status" },
  { code: "10-7", name: "Out of Service", description: "Unit is unavailable for calls.", category: "Status" },
  { code: "10-8", name: "In Service", description: "Unit is available for calls.", category: "Status" },
  { code: "10-9", name: "Repeat", description: "Please repeat the last transmission.", category: "Radio" },
  { code: "10-10", name: "Off Duty", description: "Unit is off duty.", category: "Status" },
  { code: "10-12", name: "Visitors Present", description: "Civilians within earshot — use discretion.", category: "Status" },
  { code: "10-13", name: "Weather/Road Report", description: "Advise current weather or road conditions.", category: "Info" },
  { code: "10-15", name: "Prisoner in Custody", description: "Transporting prisoner.", category: "Status" },
  { code: "10-16", name: "Pick Up Prisoner", description: "Respond to pick up prisoner.", category: "Status" },
  { code: "10-17", name: "Pick Up Papers", description: "Pick up paperwork or documents.", category: "Status" },
  { code: "10-18", name: "Urgent", description: "Complete present assignment as quickly as possible.", category: "Priority" },
  { code: "10-19", name: "Return to Station", description: "Return to your assigned station.", category: "Status" },
  { code: "10-20", name: "Location", description: "Advise your current location.", category: "Info" },
  { code: "10-21", name: "Telephone", description: "Call by telephone.", category: "Info" },
  { code: "10-22", name: "Disregard", description: "Cancel last assignment.", category: "Status" },
  { code: "10-23", name: "On Scene / Arrived", description: "Arrived at the scene of the call.", category: "Status" },
  { code: "10-24", name: "Assignment Completed", description: "Last call/assignment complete.", category: "Status" },
  { code: "10-25", name: "Meet (Person)", description: "Meet the named person at given location.", category: "Status" },
  { code: "10-26", name: "Detaining Subject", description: "Expedite reply.", category: "Status" },
  { code: "10-27", name: "Driver License Check", description: "Request DL information.", category: "Info" },
  { code: "10-28", name: "Vehicle Registration Check", description: "Request tag/VIN information.", category: "Info" },
  { code: "10-29", name: "Wanted/Stolen Check", description: "Check person or property for warrants/theft.", category: "Info" },
  { code: "10-30", name: "Unauthorized Use of Radio", description: "Improper use — discontinue.", category: "Radio" },
  { code: "10-32", name: "Person with a Gun", description: "Subject is armed with a firearm.", category: "Priority" },
  { code: "10-33", name: "Emergency — All Units Stand By", description: "Hold the air for emergency traffic.", category: "Priority" },
  { code: "10-34", name: "Riot", description: "Civil disturbance in progress.", category: "Priority" },
  { code: "10-35", name: "Major Crime Alert", description: "Major crime broadcast.", category: "Priority" },
  { code: "10-36", name: "Time Check", description: "Request current time.", category: "Info" },
  { code: "10-37", name: "Suspicious Vehicle", description: "Investigate suspicious vehicle.", category: "Status" },
  { code: "10-38", name: "Stopping Suspicious Vehicle", description: "Conducting traffic stop on suspicious vehicle.", category: "Status" },
  { code: "10-39", name: "Run with Lights & Siren", description: "Respond Code 3 — emergency.", category: "Priority" },
  { code: "10-40", name: "Run Silent (No Lights/Siren)", description: "Respond without warning equipment.", category: "Status" },
  { code: "10-50", name: "Traffic Crash", description: "Motor-vehicle crash.", category: "Calls" },
  { code: "10-51", name: "Wrecker Needed", description: "Tow truck requested.", category: "Calls" },
  { code: "10-52", name: "Ambulance Needed", description: "EMS requested.", category: "Calls" },
  { code: "10-53", name: "Road Blocked", description: "Roadway is obstructed.", category: "Info" },
  { code: "10-54", name: "Livestock on Road", description: "Animals creating hazard.", category: "Info" },
  { code: "10-55", name: "Intoxicated Driver", description: "DUI suspect.", category: "Calls" },
  { code: "10-56", name: "Intoxicated Pedestrian", description: "Drunk in public.", category: "Calls" },
  { code: "10-57", name: "Hit and Run", description: "Driver left the scene.", category: "Calls" },
  { code: "10-59", name: "Escort", description: "Escort or convoy.", category: "Status" },
  { code: "10-62", name: "Reply to Message", description: "Acknowledge previous message.", category: "Radio" },
  { code: "10-66", name: "Suspicious Person", description: "Investigate suspicious subject.", category: "Calls" },
  { code: "10-70", name: "Fire Alarm", description: "Fire reported.", category: "Calls" },
  { code: "10-71", name: "Advise Nature of Fire", description: "Provide fire details.", category: "Info" },
  { code: "10-79", name: "Notify Coroner / ME", description: "Medical examiner needed.", category: "Calls" },
  { code: "10-80", name: "Pursuit in Progress", description: "Vehicle pursuit underway.", category: "Priority" },
  { code: "10-90", name: "Bank Alarm", description: "Bank alarm activation.", category: "Priority" },
  { code: "10-91", name: "Pick Up", description: "Pick up subject/item.", category: "Status" },
  { code: "10-95", name: "Subject in Custody", description: "Have subject detained.", category: "Status" },
  { code: "10-97", name: "Arrived at Scene", description: "On scene (alt).", category: "Status" },
  { code: "10-98", name: "Assignment Completed (alt)", description: "Available for next call.", category: "Status" },
  { code: "10-99", name: "Officer Needs Help — Emergency", description: "Officer in distress — all available units respond.", category: "Priority" },
];

export const SIGNAL_CODES: CodeEntry[] = [
  { code: "Signal 0", name: "Officer Down / Help Urgent", description: "Officer requires immediate assistance.", category: "Priority" },
  { code: "Signal 4", name: "Traffic Crash", description: "Vehicle accident.", category: "Calls" },
  { code: "Signal 5", name: "Crash with Injuries", description: "Accident with injured persons.", category: "Calls" },
  { code: "Signal 7", name: "Dead Person / DOA", description: "Deceased person on scene.", category: "Calls" },
  { code: "Signal 11", name: "Person Down", description: "Subject collapsed or unconscious.", category: "Calls" },
  { code: "Signal 12", name: "Drug Activity", description: "Narcotics complaint.", category: "Calls" },
  { code: "Signal 14", name: "Disturbance", description: "Verbal or physical disturbance.", category: "Calls" },
  { code: "Signal 15", name: "Domestic Disturbance", description: "Family/household dispute.", category: "Calls" },
  { code: "Signal 17", name: "Suspicious Person", description: "Investigate person on scene.", category: "Calls" },
  { code: "Signal 18", name: "Suspicious Vehicle", description: "Investigate vehicle on scene.", category: "Calls" },
  { code: "Signal 19", name: "Suspicious Incident", description: "General suspicious activity.", category: "Calls" },
  { code: "Signal 20", name: "Mental Subject", description: "Subject experiencing mental crisis.", category: "Calls" },
  { code: "Signal 21", name: "Prowler", description: "Prowler reported.", category: "Calls" },
  { code: "Signal 22", name: "Missing Person", description: "Missing or runaway.", category: "Calls" },
  { code: "Signal 23", name: "Burglar Alarm", description: "Alarm activation, building.", category: "Calls" },
  { code: "Signal 24", name: "Open Door / Window", description: "Building found open.", category: "Calls" },
  { code: "Signal 25", name: "Fire", description: "Structure or vehicle fire.", category: "Calls" },
  { code: "Signal 26", name: "Bomb Threat", description: "Threat against property/persons.", category: "Priority" },
  { code: "Signal 27", name: "Trespass", description: "Trespasser on property.", category: "Calls" },
  { code: "Signal 30", name: "Burglary", description: "Burglary in progress or just occurred.", category: "Calls" },
  { code: "Signal 31", name: "Robbery", description: "Robbery in progress or just occurred.", category: "Priority" },
  { code: "Signal 32", name: "Shooting", description: "Shots fired / gunshot victim.", category: "Priority" },
  { code: "Signal 33", name: "Stabbing", description: "Stabbing incident.", category: "Priority" },
  { code: "Signal 34", name: "Assault / Battery", description: "Assault in progress or just occurred.", category: "Calls" },
  { code: "Signal 36", name: "Theft", description: "Theft (larceny).", category: "Calls" },
  { code: "Signal 37", name: "Stolen Vehicle", description: "Auto theft.", category: "Calls" },
  { code: "Signal 38", name: "Recovered Stolen Vehicle", description: "Stolen vehicle located.", category: "Calls" },
  { code: "Signal 40", name: "Hit and Run", description: "Crash, driver left scene.", category: "Calls" },
  { code: "Signal 41", name: "Reckless Driver", description: "Reckless driving complaint.", category: "Calls" },
  { code: "Signal 43", name: "Animal Complaint", description: "Loose, injured, or aggressive animal.", category: "Calls" },
  { code: "Signal 45", name: "Loitering", description: "Persons loitering.", category: "Calls" },
  { code: "Signal 50", name: "Armed Subject", description: "Subject known to be armed.", category: "Priority" },
  { code: "Signal 60", name: "Alarm — Fire", description: "Fire alarm activation.", category: "Calls" },
  { code: "Signal 88", name: "Sex Offense", description: "Sexual offense investigation.", category: "Priority" },
];

export const RADIO_DIRECTORY: RadioContact[] = [
  { callsign: "Dispatch", unit: "Communications", channel: "TAC-1", notes: "Primary dispatch channel." },
  { callsign: "Supervisor", unit: "Watch Commander", channel: "TAC-1", notes: "On-duty supervisor." },
  { callsign: "D1-1", unit: "District 1 Patrol", channel: "TAC-2" },
  { callsign: "D2-1", unit: "District 2 Patrol", channel: "TAC-3" },
  { callsign: "D3-1", unit: "District 3 Patrol", channel: "TAC-4" },
  { callsign: "HQ-1", unit: "Headquarters", channel: "TAC-1", notes: "HQ desk." },
  { callsign: "OFC-1", unit: "Office Volunteers", channel: "TAC-1", notes: "Non-field office staff." },
  { callsign: "SE-1", unit: "Special Events", channel: "EVT-1", notes: "Special events talk-around." },
  { callsign: "EMS", unit: "Fire/Rescue", channel: "MED-1", notes: "Switch on request from dispatch." },
  { callsign: "Air-1", unit: "Aviation", channel: "AIR-1", notes: "Helicopter ops." },
  { callsign: "K9-1", unit: "K-9 Unit", channel: "TAC-2", notes: "Request via dispatch." },
];
