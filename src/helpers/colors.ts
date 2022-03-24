import * as convert from 'color-convert';


interface Limits {
	[C : string]: {min: number, delta: number}
}

const HueLimits: Limits = {
	red: { min: 0, delta: 30},
	yellow: { min: 30, delta: 30},
	green: { min: 60, delta: 100},
	blue: { min: 160, delta: 110},
	purpule: { min: 270, delta: 30},
}
// Uterum
// Röd 27-
// gul 25-27
// grön 18-25
// blå 12-18
// violett < 12
const uterumTempValueLimits: Limits = {
    red: { min: 27, delta: 3},
	yellow: { min: 25, delta: 2},
	green: { min: 18, delta: 7},
	blue: { min: 12, delta: 6},
    purpule: { min: 0, delta: 12},
}
export function hex(value: number, valueLimits: Limits) {
    for (const C in valueLimits) {
        if (value >= valueLimits[C].min) {
            let valuePart = (value - valueLimits[C].min)/valueLimits[C].delta;
            valuePart = valuePart > 1 ? 1 : valuePart;
            const hueDelta = valuePart*HueLimits[C].delta;
            const hue = HueLimits[C].min + HueLimits[C].delta - hueDelta; 
            return convert.hsl.hex([hue, 1, 1]);
        }
    }
    const hue = HueLimits.purpule.min + HueLimits.purpule.delta;
    return convert.hsl.hex([hue, 1, 1]);
}

// gul-maxfärgvärde - färgdelta 

        // färgintervall (förutbestämt) = gul-maxfärgvärde - gul-minfärgvärde = 60-30 = 30
        // Värdeintervall (konfigurerbart per sensor) gul-max--gul-min
        // Värdeandel = (värde - gul-min)/Värdeintervall = (25,5 -25)/(27-25) = 0,5/2 = 1/4
        
        // Färgdelta = Värdeandel*färgintervall = 1/4*30 = 7,5
        // Färgvärde = gul-maxfärgvärde - färgdelta 

// Röd 30-0
// gul 60-30
// grön 160-120-60
// blå 270-240-160
// Violett 300-270

// November till mars
// Förrådet 
// röd 11+
// gul 8-11
// grön 5-18
// blå 0-4
// Violett < 0

// Uterum
// Röd 27-
// gul 25-27
// grön 18-25
// blå 12-18
// violett < 12

// Urerum värde: 25,5
// Är värde större ön röd-minvärde, nej
// Är värde Större än gul-minvärde ja =>

// färgintervall (förutbestämt) = gul-maxfärgvärde - gul-minfärgvärde = 60-30 = 30
// Värdeintervall (konfigurerbart per sensor) gul-max--gul-min
// Värdeandel = (värde - gul-min)/Värdeintervall = (25,5 -25)/(27-25) = 0,5/2 = 1/4
// Färgdelta = Värdeandel*färgintervall = 1/4*30 = 7,5
// Färgvärde = gul-maxfärgvärde - färgdelta 

// 0,5/2* -> 1/ av intervallet 