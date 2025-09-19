import React from 'react';

export default function FlightCards() {
  const flightData = [
    {
      route: "Los Angeles → New York",
      price: "$2,850",
      time: "Tomorrow, 2:00 PM",
      aircraft: "Gulfstream G650",
      seats: "8 seats available",
      savings: "Save $25,650 (90% off)",
      rotation: "rotate-1"
    },
    {
      route: "Miami → Las Vegas", 
      price: "$1,200",
      time: "Tomorrow, 11:30 AM",
      aircraft: "Citation X",
      seats: "6 seats available", 
      savings: "Save $23,800 (95% off)",
      rotation: "-rotate-1"
    },
    {
      route: "Chicago → Aspen",
      price: "$899", 
      time: "Tomorrow, 4:15 PM",
      aircraft: "King Air 350",
      seats: "4 seats available",
      savings: "Save $18,601 (95% off)",
      rotation: "rotate-1"
    },
    {
      route: "Dallas → San Francisco",
      price: "$1,800",
      time: "Tomorrow, 8:45 AM", 
      aircraft: "Falcon 7X",
      seats: "10 seats available",
      savings: "Save $34,200 (95% off)",
      rotation: "-rotate-1"
    },
    {
      route: "Boston → Miami",
      price: "$1,400",
      time: "Tomorrow, 1:20 PM",
      aircraft: "Hawker 900XP", 
      seats: "7 seats available",
      savings: "Save $25,600 (95% off)",
      rotation: "rotate-1"
    },
    {
      route: "Seattle → Denver",
      price: "$399",
      time: "Tomorrow, 9:15 AM",
      aircraft: "Citation CJ4",
      seats: "5 seats available", 
      savings: "Save $7,601 (95% off)",
      rotation: "-rotate-1"
    },
    {
      route: "Atlanta → Phoenix",
      price: "$2,995",
      time: "Tomorrow, 3:30 PM",
      aircraft: "Learjet 75",
      seats: "6 seats available",
      savings: "Save $27,005 (90% off)", 
      rotation: "rotate-1"
    }
  ];

  // Duplicate the data for seamless looping
  const duplicatedFlights = [...flightData, ...flightData];

  return (
    <section className="py-16 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Available Flights Right Now
        </h2>
        <p className="text-white/80 text-lg">
          Discover luxury flights at unbeatable prices
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
        
        {/* Scrolling container */}
        <div className="flight-cards-scroll" style={{ height: '220px' }}>
          <div className="flex gap-6 py-4">
            {duplicatedFlights.map((flight, index) => (
              <div key={index} className="card-wrapper">
                <div
                  className={`card-inner bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform ${flight.rotation} hover:rotate-0 hover:scale-105 transition-all duration-300 border border-violet-100`}
                >
                  <div className="card-header">
                    <div className="card-route">{flight.route}</div>
                    <div className="card-price">{flight.price}</div>
                  </div>
                  <div className="card-time">{flight.time}</div>
                  <div className="card-aircraft">{flight.aircraft} • {flight.seats}</div>
                  <div className="card-savings">
                    {flight.savings}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}