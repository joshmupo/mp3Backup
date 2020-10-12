//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4
var holder = "";
var buttonId = 0;
// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function (name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ");
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
function displayPatient(pt) {
  document.getElementById("patient_name").innerHTML = getPatientName(pt);
  document.getElementById("gender").innerHTML = pt.gender;
  document.getElementById("dob").innerHTML = pt.birthDate;
}

//function to display list of medications
function displayMedication(meds) {
  med_list.innerHTML += "<li> " + meds + "</li>";
}

function displayRecommendedMedications(recMeds)
{
  recommended_med_list.innerHTML += "<td id=recMed" +buttonId +">" + recMeds + "</td>"+"<td> <button class='recommended-button' id=" + buttonId +" onclick=createMedicationRequest(this);>Add Medication</button></td>";
  buttonId++;

}

function createMedicationRequest(clickedField)
{
  //create med request for the value of clicked id and then display in medication requests
  var medName = document.getElementById("recMed" + clickedField.id).innerHTML;
  var medRequest = {
    resourceType: "MedicationRequest",
    status: "active",
    intent: "order",
    medicationCodeableConcept: {
      coding: [
        {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "",
        display: ""
        }
      ],
      text: ""
    },
    subject: {
      reference: "Patient/"+ client.patient.id
    }
  }

  if (medName.includes("LOW CALCIUM"))
  {
    medRequest.medicationCodeableConcept.coding[0].code = "1046402";
    medRequest.medicationCodeableConcept.coding[0].display = "1.7 ML denosumab 70 MG/ML Injection [Xgeva]";
    medRequest.medicationCodeableConcept.text = "1.7 ML denosumab 70 MG/ML Injection [Xgeva]";
  }
  else if (medName.includes("HIGH CALCIUM"))
  {
    medRequest.medicationCodeableConcept.coding[0].code = "209006";
    medRequest.medicationCodeableConcept.coding[0].display = "Calcitriol 0.00025 MG Oral Capsule [Rocaltrol]";
    medRequest.medicationCodeableConcept.text = "Calcitriol 0.00025 MG Oral Capsule [Rocaltrol]";
  }
  else if (medName.includes("LOW CREATININE"))
  {
    medRequest.medicationCodeableConcept.coding[0].code = "104062";
    medRequest.medicationCodeableConcept.coding[0].display = "Cimetidine 200 MG Oral Tablet [Tagamet]";
    medRequest.medicationCodeableConcept.text = "Cimetidine 200 MG Oral Tablet [Tagamet]";
  }
  else if (medName.includes("HIGH CREATININE"))
  {
    medRequest.medicationCodeableConcept.coding[0].code = "208406";
    medRequest.medicationCodeableConcept.coding[0].display = "Sulfamethoxazole 40 MG/ML / trimethoprim 8 MG/ML Oral Suspension [Sulfatrim]";
    medRequest.medicationCodeableConcept.text = "Sulfamethoxazole 40 MG/ML / trimethoprim 8 MG/ML Oral Suspension [Sulfatrim]";
  }
  else if (medName.includes("LOW BLOOD"))
  {
    medRequest.medicationCodeableConcept.coding[0].code = "313979";
    medRequest.medicationCodeableConcept.coding[0].display = "Fludrocortisone acetate 0.1 MG Oral Tablet";
    medRequest.medicationCodeableConcept.text = "Fludrocortisone acetate 0.1 MG Oral Tablet";
  }
  else if (medName.includes("HIGH BLOOD"))
  {
    medRequest.medicationCodeableConcept.coding[0].code = "998693";
    medRequest.medicationCodeableConcept.coding[0].display = "Acebutolol (as acebutolol HCl) 100 MG Oral Capsule";
    medRequest.medicationCodeableConcept.text = "Acebutolol (as acebutolol HCl) 100 MG Oral Capsule";
  }
  else if (medName.includes("HIGH LDL"))
  {
    medRequest.medicationCodeableConcept.coding[0].code = "262095";
    medRequest.medicationCodeableConcept.coding[0].display = "Atorvastatin 80 MG Oral Tablet [Lipitor]";
    medRequest.medicationCodeableConcept.text = "Atorvastatin 80 MG Oral Tablet [Lipitor]";
  }
  
  else{
    console.log("nothing found");
    return;
  }

  client.create(medRequest);
  var list = document.getElementById("med_list");
  var li = document.createElement("li");
  li.textContent = medRequest.medicationCodeableConcept.text;
  list.prepend(li);

}

//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (
    typeof ob != "undefined" &&
    typeof ob.valueQuantity != "undefined" &&
    typeof ob.valueQuantity.value != "undefined" &&
    typeof ob.valueQuantity.unit != "undefined"
  ) {
    return (
      Number(parseFloat(ob.valueQuantity.value).toFixed(2)) +
      " " +
      ob.valueQuantity.unit
    );
  } else {
    return undefined;
  }
}

function getQuantityValue(ob)
{
  if (
    typeof ob != "undefined" &&
    typeof ob.valueQuantity != "undefined" &&
    typeof ob.valueQuantity.value != "undefined"
  ) {
    return Number(parseFloat(ob.valueQuantity.value).toFixed(2));

  } else {
    return undefined;
  }
}

// helper function to get both systolic and diastolic bp
function getBloodPressureValue(BPObservations, typeOfPressure) {
  var formattedBPObservations = [];
  BPObservations.forEach(function (observation) {
    var BP = observation.component.find(function (component) {
      return component.code.coding.find(function (coding) {
        return coding.code == typeOfPressure;
      });
    });
    if (BP) {
      observation.valueQuantity = BP.valueQuantity;
      formattedBPObservations.push(observation);
    }
  });

  return getQuantityValueAndUnit(formattedBPObservations[0]);
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    height: {
      value: "",
    },
    weight: {
      value: "",
    },
    sys: {
      value: "",
    },
    dia: {
      value: "",
    },
    ldl: {
      value: "",
    },
    hdl: {
      value: "",
    },
    calcium: {
      value: "",
    },
    creatinine: {
      value: "",
    },
  };
}

//helper function to display the annotation on the index page
// function displayAnnotation(annotation) {
//   note.innerHTML = annotation;
// }


//function to display the observation values you will need to update this
function displayObservation(obs) {
  hdl.innerHTML = obs.hdl;
  ldl.innerHTML = obs.ldl;
  sys.innerHTML = obs.sys;
  dia.innerHTML = obs.dia;
  height.innerHTML = obs.height;
  weight.innerHTML = obs.weight;
  calcium.innerHTML = obs.calcium;
  creatinine.innerHTML = obs.creatinine;
}

function validateCalciumLevel(calciumLevel)
{
  var lowRange = 8.6;
  var highRange = 10.3;

  if (calciumLevel <= lowRange)
  {
    return "LOW CALCIUM - 1.7 ML denosumab 70 MG/ML Injection [Xgeva]";
  }
  else if (calciumLevel >= highRange)
  {
    return "HIGH CALCIUM - Calcitriol 0.00025 MG Oral Capsule [Rocaltrol]    ";
  }
  else
  {
    return "normal";
  }

}

function validateCreatinineLevel(creatinineLevel)
{
  var lowRange = .6;
  var highRange = 1.3;

  if (creatinineLevel <= lowRange)
  {
    return "LOW CREATININE - Cimetidine 200 MG Oral Tablet [Tagamet]";
  }
  else if (creatinineLevel >= highRange)
  {
    return "HIGH CREATININE - Sulfamethoxazole 40 MG/ML / trimethoprim 8 MG/ML Oral Suspension [Sulfatrim]    ";
  }
  else
  {
    return "normal";
  }

}

function validateLDL(ldl)
{
  var highRange = 190;

  if (ldl >= highRange)
  {
    return "HIGH LDL - Atorvastatin 80 MG Oral Tablet [Lipitor]";
  }
  else
  {
    return "normal";
  }

}

function validateBloodPressure(systolic, diastolic)
{
  var lowRangeSys = 90;
  var highRangeSys = 139;
  var lowRangeDia = 60;
  var highRangeDia = 89;

  if (systolic <= lowRangeSys || diastolic <= lowRangeDia)
  {
    return "LOW BLOOD PRESSURE - Fludrocortisone acetate 0.1 MG Oral Tablet";
  }
  else if (systolic >= highRangeSys || diastolic >= highRangeDia)
  {
    return "HIGH BLOOD PRESSURE - Acebutolol (as acebutolol HCl) 100 MG Oral Capsule";
  }
  else
  {
    return "normal";
  }

}

//once fhir client is authorized then the following functions can be executed
FHIR.oauth2
  .ready()
  .then(function (client) {
    // get patient object and then display its demographics info in the banner
    client.request(`Patient/${client.patient.id}`).then(function (patient) {
      displayPatient(patient);
      console.log(patient);
    });

    // get observation resoruce values
    // you will need to update the below to retrive the weight and height values
    var query = new URLSearchParams();

    query.set("patient", client.patient.id);
    query.set("_count", 100);
    query.set("_sort", "-date");
    query.set(
      "code",
      [
        "http://loinc.org|8462-4",
        "http://loinc.org|8480-6",
        "http://loinc.org|2085-9",
        "http://loinc.org|2089-1",
        "http://loinc.org|55284-4",
        "http://loinc.org|3141-9",
        "http://loinc.org|8302-2",
        "http://loinc.org|29463-7",
        "http://loinc.org|49765-1",
        "http://loinc.org|38483-4",
      ].join(",")
    );

    client
      .request("Observation?" + query, {
        pageLimit: 0,
        flat: true,
      })
      .then(function (ob) {
        holder = ob;
        // group all of the observation resoruces by type into their own
        var byCodes = client.byCodes(ob, "code");
        var systolicbp = getBloodPressureValue(byCodes("55284-4"), "8480-6");
        var diastolicbp = getBloodPressureValue(byCodes("55284-4"), "8462-4");
        var hdl = byCodes("2085-9");
        var ldl = byCodes("2089-1");
        var weight = byCodes("29463-7");
        var height = byCodes("8302-2");
        var calcium = byCodes("49765-1");
        var creatinine = byCodes("38483-4");

        // create patient object
        var p = defaultPatient();

        // set patient value parameters to the data pulled from the observation resoruce
        if (typeof systolicbp != "undefined") {
          p.sys = systolicbp;
        } else {
          p.sys = "undefined";
        }

        if (typeof diastolicbp != "undefined") {
          p.dia = diastolicbp;
        } else {
          p.dia = "undefined";
        }

        p.hdl = getQuantityValueAndUnit(hdl[0]);
    p.ldl = getQuantityValueAndUnit(ldl[0]);
    p.weight = getQuantityValueAndUnit(weight[0]);
    p.height = getQuantityValueAndUnit(height[0]);
    p.calcium = getQuantityValueAndUnit(calcium[0]);
    p.creatinine = getQuantityValueAndUnit(creatinine[0]);

    var calciumValue = getQuantityValue(calcium[0]);
    var calciumValidation = validateCalciumLevel(calciumValue);

    var creatinineValue = getQuantityValue(creatinine[0]);
    var creatinineValidation = validateCreatinineLevel(creatinineValue);

    var bpSys = systolicbp.split(" ")[0];
    var bpDia = diastolicbp.split(" ")[0];
    var bpValidation = validateBloodPressure(bpSys, bpDia);

    var ldlValue = getQuantityValue(ldl[0]);
    var ldlValidation = validateLDL(ldlValue);

    //ldl level

    var recommendedMedications = [];

    if (calciumValidation && calciumValidation != "normal")
    {
      //later make the calcium text red when it is not normal
      recommendedMedications.push(calciumValidation);

    }

    if (creatinineValidation && creatinineValidation != "normal")
    {
      recommendedMedications.push(creatinineValidation);

    }

    if (bpValidation && bpValidation != "normal")
    {
      recommendedMedications.push(bpValidation);

    }

    if (ldlValidation && ldlValidation != "normal")
    {
      recommendedMedications.push(ldlValidation);

    }


    displayObservation(p);

    recommendedMedications.forEach(function (recMed) {
      displayRecommendedMedications(recMed);
    });
  });

    client
      .request({
        url: "MedicationRequest?patient=" + client.patient.id,
      })
      .then(function (pat) {
        if (
          pat == null ||
          pat.entry == null ||
          pat.length < 1 ||
          pat.entry.length < 1
        ) {
          displayMedication(
            "No medications for patient id: " + client.patient.id
          );
        }
        pat.entry.forEach(function (med) {
          displayMedication(med.resource.medicationCodeableConcept.text);
        });
      });

    //update function to take in text input from the app and add the note for the latest weight observation annotation
    //you should include text and the author can be set to anything of your choice. keep in mind that this data will
    // be posted to a public sandbox
  //   function addWeightAnnotation() {
  //     var annotation = document.getElementById("annotation").value;
  //     var byCodes = client.byCodes(holder, "code");
  //     var weight = byCodes("29463-7");
  //     displayAnnotation(annotation);

  //     weight.sort((a, b) => {
  //       return new Date(b.meta.lastUpdated) - new Date(a.meta.lastUpdated);
  //     });

  //     var note = {
  //       authorString: "josh",
  //       time: new Date().toISOString(),
  //       text: annotation,
  //     };

  //     client
  //       .request({
  //         url: "Observation/" + weight[0].id,
  //       })
  //       .then(function (obs) {
  //         if (obs.note) {
  //           obs.note.push(note);
  //         } else {
  //           obs.note = [note];
  //         }

  //         client.update(obs);
  //       });
  //   }

  //   //event listner when the add button is clicked to call the function that will add the note to the weight observation
  //   document
  //     .getElementById("add")
  //     .addEventListener("click", addWeightAnnotation);
  // })
  // .catch(console.error);
