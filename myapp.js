/**
 * At the time of signing or verifying, the payloads could be ordered different
 * The hash of the message is generated based on the order in they which appear
 * and so lets order it alphabetically.
 * This function sorts keys and values and does it recursively.
 * @param {*} jsonObjToSort 
 */
const getSortedJson = (jsonObjToSort) => {
  var sorted = {}
  Object.keys(jsonObjToSort).sort().forEach(function(key) {
    if (Array.isArray(sorted[key])) {
      var typeName = typeof(sorted[key][0])
      if (typeName === "object") {
        // The first element within the array is a Json object. Sort that
        sorted[key] = getSortedJson(sorted[key][0])
      } else {
        // The array contains simple values, sort it ascending
        var arr
        if (typeName === "number") {
          // This is required, otherwise 20 will appear before 3.
          arr = sorted[key].sort(function(a, b){return a-b});
        } else {
          arr = sorted[key].sort();
        }
        sorted[key] = arr.slice()
      }
    } else if (typeof(sorted[key]) === "object") {
      sorted[key] = getSortedJson(sorted[key])
    } else {
      sorted[key] = jsonObjToSort[key];
    }
  })
  return sorted;
}

var doDiff = function(sortedSignPayload, sortedVerifyPayload, callback) {
const { exec } = require('child_process');
var cmdToExecute = 'diff ' + ' <(echo \"' + 
                    JSON.stringify(sortedSignPayload) + '\") ' + 
                    ' <(echo \"' + 
                    JSON.stringify(sortedVerifyPayload) + '\")'
console.log("Command to execute = " + cmdToExecute)


exec(cmdToExecute, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    callback(err);
  }

  // the *entire* stdout and stderr (buffered)
  //console.log(`stdout: ${stdout}`);
  //console.log(`stderr: ${stderr}`);
  callback(err, stdout)
});
}

var signPayload = {
	"@context": 
	{
		"@vocab": "http://localhost:8080/",
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
		"teacher": "http://localhost:8080/",
		"xsd": "http://www.w3.org/2001/XMLSchema#",
		"sc": "https://w3id.org/security/v1/",
		"dc": "http://purl.org/dc/terms/"
	},

	"@graph": 
	[
		{
			"@type": "Teacher",
			"basicProficiencyLevel": 
			[
				{
					"@type": "BasicProficiencyLevel",
					"proficiencyAcademicQualification": 
					{
						"@id": "teacher:AcademicQualificationTypeCode-PHD"
					},

					"proficiencySubject": 
					{
						"@id": "teacher:SubjectCode-MATH"
					}
				},

				{
					"@type": "BasicProficiencyLevel",
					"proficiencyAcademicQualification": 
					{
						"@id": "teacher:AcademicQualificationTypeCode-HIGHERSECONDARY"
					},

					"proficiencySubject": 
					{
						"@id": "teacher:SubjectCode-ENGLISH"
					}
				},

				{
					"@type": "BasicProficiencyLevel",
					"proficiencyAcademicQualification": 
					{
						"@id": "teacher:AcademicQualificationTypeCode-SECONDARY"
					},

					"proficiencySubject": 
					{
						"@id": "teacher:SubjectCode-SOCIALSTUDIES"
					}
				}
			],

			"birthDate": 
			{
				"@type": "xsd:date",
				"@value": "1990-12-06"
			},

			"disabilityType": 
			{
				"@id": "teacher:DisabilityCode-NA"
			},

			"gender": 
			{
				"@id": "teacher:GenderTypeCode-MALE"
			},

			"highestAcademicQualification": 
			{
				"@id": "teacher:AcademicQualificationTypeCode-PHD"
			},

			"highestTeacherQualification": 
			{
				"@id": "teacher:TeacherQualificationTypeCode-MED"
			},

			"inServiceTeacherTrainingFromBRC": 
			{
				"@type": "InServiceTeacherTrainingFromBlockResourceCentre",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "10"
				}
			},

			"inServiceTeacherTrainingFromCRC": 
			{
				"@type": "InServiceTeacherTrainingFromClusterResourceCentre",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "2"
				}
			},

			"inServiceTeacherTrainingFromDIET": 
			{
				"@type": "InServiceTeacherTrainingFromDIET",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "5.5"
				}
			},

			"inServiceTeacherTrainingFromOthers": 
			{
				"@type": "InServiceTeacherTrainingFromOthers",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "3.5"
				}
			},

			"nationalIdentifier": "1234567890123456",
			"nonTeachingAssignmentsForAcademicCalendar": 
			{
				"@type": "NonTeachingAssignmentsForAcademicCalendar",
				"daysOfNonTeachingAssignments": 
				{
					"@type": "xsd:decimal",
					"@value": "6"
				}
			},

			"serialNum": 3.0,
			"signatures": 
			[
				{
					"@type": "sc:GraphSignature2012",
					"created": 
					{
						"@type": "sc:created",
						"@value": "2017-09-23T20:21:34Z"
					},

					"creator": 
					{
						"@type": "sc:creator",
						"@value": "https://example.com/i/pat/keys/5"
					},

					"domain": 
					{
						"@type": "sc:domain",
						"@value": "http://localhost:8080/"
					},

					"nonce": 
					{
						"@type": "sc:nonce",
						"@value": "2bbgh3dgjg2302d-d2b3gi423d42"
					},

					"signatureFor": 
					{
						"@type": "xsd:anyURI",
						"@value": "http://localhost:8080/serialNum"
					},

					"signatureValue": 
					{
						"@type": "sc:signatureValue",
						"@value": "eyiOiJKJ0eXA...OEjgFWFXk"
					}
				},

				{
					"@type": "sc:RsaSignature2018",
					"created": 
					{
						"@type": "sc:created",
						"@value": "2017-09-23T20:21:34Z"
					},

					"creator": 
					{
						"@type": "sc:creator",
						"@value": "https://example.com/i/pat/keys/5"
					},

					"domain": 
					{
						"@type": "sc:domain",
						"@value": "http://localhost:8080/"
					},

					"nonce": 
					{
						"@type": "sc:nonce",
						"@value": "2bbgh3dgjg2302d-d2b3gi423d42"
					},

					"signatureFor": 
					{
						"@type": "xsd:anyURI",
						"@value": "http://localhost:8080/nationalIdentifier"
					},

					"signatureValue": 
					{
						"@type": "sc:signatureValue",
						"@value": "eyiOiJKJ0eXA...OEjgFWFXk"
					}
				}
			],

			"socialCategory": 
			{
				"@id": "teacher:SocialCategoryTypeCode-GENERAL"
			},

			"teacherCode": "12234",
			"teacherName": "Marvin Pande",
			"teachingRole": 
			{
				"@type": "TeachingRole",
				"appointedForSubjects": 
				{
					"@id": "teacher:SubjectCode-ENGLISH"
				},

				"appointmentType": 
				{
					"@id": "teacher:TeacherAppointmentTypeCode-REGULAR"
				},

				"appointmentYear": 
				{
					"@type": "xsd:gYear",
					"@value": "2015"
				},

				"classesTaught": 
				{
					"@id": "teacher:ClassTypeCode-SECONDARYANDHIGHERSECONDARY"
				},

				"mainSubjectsTaught": 
				{
					"@id": "teacher:SubjectCode-ENGLISH"
				},

				"teacherType": 
				{
					"@id": "teacher:TeacherTypeCode-HEAD"
				}
			},

			"trainedForChildrenSpecialNeeds": 
			{
				"@id": "teacher:YesNoCode-YES"
			},

			"trainedinUseOfComputer": 
			{
				"@id": "teacher:YesNoCode-YES"
			},

			"yearOfJoiningService": 
			{
				"@type": "xsd:gYear",
				"@value": "2014"
			}
		}
	]
}
var verifyPayload = {
	"@context": 
	{
		"@vocab": "http://localhost:8080/",
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
		"teacher": "http://localhost:8080/",
		"xsd": "http://www.w3.org/2001/XMLSchema#",
		"sc": "https://w3id.org/security/v1/",
		"dc": "http://purl.org/dc/terms/"
	},

	"@graph": 
	[
		{
			"@type": "Teacher",
			"basicProficiencyLevel": 
			[
				{
					"@type": "BasicProficiencyLevel",
					"proficiencyAcademicQualification": 
					{
						"@id": "teacher:AcademicQualificationTypeCode-HIGHERSECONDARY"
					},

					"proficiencySubject": 
					{
						"@id": "teacher:SubjectCode-ENGLISH"
					}
				},

				{
					"@type": "BasicProficiencyLevel",
					"proficiencyAcademicQualification": 
					{
						"@id": "teacher:AcademicQualificationTypeCode-PHD"
					},

					"proficiencySubject": 
					{
						"@id": "teacher:SubjectCode-MATH"
					}
				},

				{
					"@type": "BasicProficiencyLevel",
					"proficiencyAcademicQualification": 
					{
						"@id": "teacher:AcademicQualificationTypeCode-SECONDARY"
					},

					"proficiencySubject": 
					{
						"@id": "teacher:SubjectCode-SOCIALSTUDIES"
					}
				}
			],

			"birthDate": 
			{
				"@type": "xsd:date",
				"@value": "1990-12-06"
			},

			"disabilityType": 
			{
				"@id": "teacher:DisabilityCode-NA"
			},

			"gender": 
			{
				"@id": "teacher:GenderTypeCode-MALE"
			},

			"highestAcademicQualification": 
			{
				"@id": "teacher:AcademicQualificationTypeCode-PHD"
			},

			"highestTeacherQualification": 
			{
				"@id": "teacher:TeacherQualificationTypeCode-MED"
			},

			"inServiceTeacherTrainingFromBRC": 
			{
				"@type": "InServiceTeacherTrainingFromBlockResourceCentre",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "10"
				}
			},

			"inServiceTeacherTrainingFromCRC": 
			{
				"@type": "InServiceTeacherTrainingFromClusterResourceCentre",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "2"
				}
			},

			"inServiceTeacherTrainingFromDIET": 
			{
				"@type": "InServiceTeacherTrainingFromDIET",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "5.5"
				}
			},

			"inServiceTeacherTrainingFromOthers": 
			{
				"@type": "InServiceTeacherTrainingFromOthers",
				"daysOfInServiceTeacherTraining": 
				{
					"@type": "xsd:decimal",
					"@value": "3.5"
				}
			},

			"nationalIdentifier": "1234567890123456",
			"nonTeachingAssignmentsForAcademicCalendar": 
			{
				"@type": "NonTeachingAssignmentsForAcademicCalendar",
				"daysOfNonTeachingAssignments": 
				{
					"@type": "xsd:decimal",
					"@value": "6"
				}
			},

			"serialNum": 3.0,
			"signatures": 
			[
				{
					"@type": "sc:RsaSignature2018",
					"created": 
					{
						"@type": "sc:created",
						"@value": "2017-09-23T20:21:34Z"
					},

					"creator": 
					{
						"@type": "sc:creator",
						"@value": "https://example.com/i/pat/keys/5"
					},

					"domain": 
					{
						"@type": "sc:domain",
						"@value": "http://localhost:8080/"
					},

					"nonce": 
					{
						"@type": "sc:nonce",
						"@value": "2bbgh3dgjg2302d-d2b3gi423d42"
					},

					"signatureFor": "http://localhost:8080/nationalIdentifier",
					"signatureValue": 
					{
						"@type": "sc:signatureValue",
						"@value": "eyiOiJKJ0eXA...OEjgFWFXk"
					}
				},

				{
					"@type": "sc:GraphSignature2012",
					"created": 
					{
						"@type": "sc:created",
						"@value": "2017-09-23T20:21:34Z"
					},

					"creator": 
					{
						"@type": "sc:creator",
						"@value": "https://example.com/i/pat/keys/5"
					},

					"domain": 
					{
						"@type": "sc:domain",
						"@value": "http://localhost:8080/"
					},

					"nonce": 
					{
						"@type": "sc:nonce",
						"@value": "2bbgh3dgjg2302d-d2b3gi423d42"
					},

					"signatureFor": "http://localhost:8080/serialNum",
					"signatureValue": 
					{
						"@type": "sc:signatureValue",
						"@value": "eyiOiJKJ0eXA...OEjgFWFXk"
					}
				}
			],

			"socialCategory": 
			{
				"@id": "teacher:SocialCategoryTypeCode-GENERAL"
			},

			"teacherCode": "12234",
			"teacherName": "Marvin Pande",
			"teachingRole": 
			{
				"@type": "TeachingRole",
				"appointedForSubjects": 
				{
					"@id": "teacher:SubjectCode-ENGLISH"
				},

				"appointmentType": 
				{
					"@id": "teacher:TeacherAppointmentTypeCode-REGULAR"
				},

				"appointmentYear": 
				{
					"@type": "xsd:gYear",
					"@value": "2015"
				},

				"classesTaught": 
				{
					"@id": "teacher:ClassTypeCode-SECONDARYANDHIGHERSECONDARY"
				},

				"mainSubjectsTaught": 
				{
					"@id": "teacher:SubjectCode-ENGLISH"
				},

				"teacherType": 
				{
					"@id": "teacher:TeacherTypeCode-HEAD"
				}
			},

			"trainedForChildrenSpecialNeeds": 
			{
				"@id": "teacher:YesNoCode-YES"
			},

			"trainedinUseOfComputer": 
			{
				"@id": "teacher:YesNoCode-YES"
			},

			"yearOfJoiningService": 
			{
				"@type": "xsd:gYear",
				"@value": "2014"
			}
		}
	]
}

var sortedSignPayload = getSortedJson(signPayload)
var sortedVerifyPayload = getSortedJson(verifyPayload)
doDiff(sortedSignPayload, sortedVerifyPayload, function(err, data){
    if (err) {
        console.log(err)
    }
    else {
        console.log(data)
    }
})