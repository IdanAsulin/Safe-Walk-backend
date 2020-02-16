const Joi = require('joi')
const sensorKitDao = require('../dao/sensorsKit')

class SensorKit {
    createKit = async (req,res) => {
        const schema = Joi.object({
            patientID: Joi.string().required(),
            IPs: Joi.array().items(
                Joi.string().default('0.0.0.0').required()
            )
        });
        const {error , value} = schema.validate(req.body)
         if(error) {
            console.error('error:' , error.message)
             return res.status(500).json({
                 message: error.message
             });
         }

         try {
             const isKitExistsAlready = await sensorKitDao.find({patientID: value.patientID})
             if(isKitExistsAlready.length === 0) {
                 const sensorKitDocument = new sensorKitDao(value);
                 const response = await sensorKitDocument.save();
                 console.log(`sensor kit was created succesfully- sensorKitID: ${response.id}`);
                 return res.status(200).json(response);
             } else {
                 console.log('sensor is already exists');
                 return res.status(202).json({
                     message: 'sensor is already exists'
                 });
             }
         } catch(err) {
            console.error('error: ', err.message)
             return res.status(500).json({
                 message: err.message
             })
         }
     }

    getAllKits = async (req,res) => {
        try {
            const response = await sensorKitDao.find()
            return res.status(200).json(response)
        } catch(err) {
            console.error('error:' , err.message)
            return res.status(500).json({
                message: err.message
            })
        }
    }

    getKitByID = async (req,res) => {
        if(!req.params.id) {
            return res.status(400).json({
                message: 'id parameter is required'
            })
        }

        try {
            const response = await sensorKitDao.findOne({id: req.params.id})
            if(!response) {
                return res.status(404).json({
                    message: `sensor kit not found`
                });
            }
            return res.status(200).json(response);
        } catch(err) {
            console.error(`Error while trying to get sensor kit (${req.params.id}): ${err.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    updateIPs = async (req,res) => {
        if (!req.params.id)
            return res.status(400).json({
                message: `sensorKitID query parameter is required`
            });

         const schema = Joi.object({
             sensor1: Joi.string().required(),
             sensor2: Joi.string().required(),
             sensor3: Joi.string().required(),
             sensor4: Joi.string().required(),
             sensor5: Joi.string().required(),
             sensor6: Joi.string().required(),
             sensor7: Joi.string().required(),
         })

        const {error , value } = schema.validate(req.body)
        if (error) {
            console.error("error has occured: " , error.message)
            return res.status(500).json({
                message: error.message
            });
        }
        try {
            const sensorKitDocument = await sensorKitDao.findOne({id: req.params.id})
            if(!sensorKitDocument) {
                return res.status(404).json({
                    message: 'sensor kit not found'
                });
            }
            if (sensorKitDocument.IPs.sensor1) sensorKitDocument.IPs.sensor1 = value.sensor1
            if (sensorKitDocument.IPs.sensor2) sensorKitDocument.IPs.sensor2 = value.sensor2
            if (sensorKitDocument.IPs.sensor3) sensorKitDocument.IPs.sensor3 = value.sensor3
            if (sensorKitDocument.IPs.sensor4) sensorKitDocument.IPs.sensor4 = value.sensor4
            if (sensorKitDocument.IPs.sensor5) sensorKitDocument.IPs.sensor5 = value.sensor5
            if (sensorKitDocument.IPs.sensor6) sensorKitDocument.IPs.sensor6 = value.sensor6
            if (sensorKitDocument.IPs.sensor7) sensorKitDocument.IPs.sensor7 = value.sensor7
            const response = await sensorKitDocument.save()
            return res.status(200).json(response);
        } catch(err) {
            console.error(`Error while trying to edit sensorKit (${req.params.id}): ${err.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    disableKit = async (req,res) => {
        if (!req.params.id)
            return res.status(400).json({
                message: `sensorKitID query parameter is required`
            });

        try{
            const sensorKitDocument = await sensorKitDao.findOneAndUpdate(
                {id: req.params.id},
                {disable: true}
                )
            if(!sensorKitDocument) {
                return res.status(404).json({
                    message: `sensor kit not found`
                });
            }
            return res.status(200).json(sensorKitDocument) // notice: its returning the object as it was BEFORE the update

        } catch(err) {
            console.error(`Error while trying to edit sensorKit (${req.params.id}): ${err.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    // TODO:: will be continued
    start = async (req,res) => {

    }
}

module.exports = SensorKit