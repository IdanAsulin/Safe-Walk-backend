const AbstractPlan = require('./plan');

class RehabPlan extends AbstractPlan {
    constructor() {
        super('rehabPlan');
    }

    addDefaultPlans = async (req, res) => {
        
    }

    removeDefaultPlans = async (req, res) => {

    }
}

module.exports = RehabPlan;