const AbstractPlan = require('./plan');

class DefaultPlan extends AbstractPlan {
    constructor() {
        super('defaultPlan');
    }
}

module.exports = DefaultPlan;