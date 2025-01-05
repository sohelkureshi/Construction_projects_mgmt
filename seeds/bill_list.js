const project = require('../model/projectSchema');

const data = [
    {
    "bill_id": 101,
    "date": "2024-10-13T00:00:00.000Z",
    "Bill_Name": "October Utilities",
    "items": [
        {
            "item_id": 1,
            "name": "Electricity",
            "quantity": 150,
            "units": "kWh",
            "rate": 0.12,
            "amount": 18.00
        },
        {
            "item_id": 2,
            "name": "Water",
            "quantity": 30,
            "units": "m3",
            "rate": 1.5,
            "amount": 45.00
        },
        {
            "item_id": 3,
            "name": "Internet",
            "quantity": 1,
            "units": "month",
            "rate": 50.00,
            "amount": 50.00
        }
    ],
    "previous_amount": 0,
    "total_amount": 113.00
}
]

module.exports = data