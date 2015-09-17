# T5 Web App
The T5 Web application is an AngularJS app developed at the SLL Medical Device Integration (MDI) Lab. 
Even though the implementation/evaluation of clinical applications is out of scope of the MDI Lab, 
a small set of proof-of-concept applications have been implemented. 
The purpose of these applications is to facilitate administration, troubleshooting and demonstration 
of the other components within the lab. Additionally, they serve as best-practice examples of FHIR-enabled 
browser applications. The following functionality is currently supported:

- Admit/Discharge patients
- Manage Patient/Device/Practitioner association
- Trouble-shooting of other components within the lab
- Monitoring Live-data

## Build & development
This project assumes that `bower`, `npm` and `grunt` are installed.

Download dependencies by running `bower install && npm install`.

Run `grunt build` for building and `grunt serve` to run a web server on `localhost:9000`.

## Usage
An API key for the `angular-fhir-resources` library is required for this app to work and is configured by following the instructions on
[angular-fhir-resources GitHub page](https://github.com/sll-mdilab/angular-fhir-resources).

### Login
To access the application one must be logged in as a *practitioner*. The practitioner **Tian Tiansson (1010101010)** is available for testing purposes, no password required:   

### Adding a patient
For the application to make sense we need a *patient* to collect data for. Adding a patient is can me done under the *Preflight* tab.
Here you can add some basic information about the patient that will be displayed throughout the application.

### Patient/Device identification
In general, one can not guarantee that the medical devices knows what patient they generate data for. 
To solve this, we have implemented an interface, the *PID* tab, where one can link a patient to multiple devices. 
When a medical device is connected to a patient the activity status is shown. The status indicates if data is 
generated from the device or not. 

To account for situations when there is no time for linking a patient to medical devices the user can alter the start time of the link retroactively. 
By selecting a medical device in the device table, controls for modifying the start time of the link is shown.

When associating a device to a patient you have the option to select HL7v2 Brokering Receivers, i.e. clients to whom the HL7v2 messages from the device will be forwarded to.
 
### Admin
#### Debug tool
The *Debug tool* is used to locate potential errors. By specifying a patient id, an overview is shown of connected devices sending data to T5 
as well as clients requesting data from T5. The overview shows the number of messages or requests sent by a device or client 
divided in successful and failed. Here you can download the log file to dig deeper into an error or 
have a sneak peek of the latest log messages.

#### HL7v2 Message Brokering
This view is used to add/edit/remove available HL7v2 Message Brokering receivers. These receivers will be the ones that shows up when adding a patient-device-association in *PID* view. 

### Live Stream
When medical devices are connected to and associated with a patient we can view the raw data in the *Live Stream* tab. Parametric data, such as pulse rate, is shown in a table format while waveform data will be visualized in a traditional way.   
