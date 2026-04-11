import { getAnandadiYoga } from './src/lib/surya-siddhanta/calendar/anandadi-yoga';

console.log("Saturday (6), Uttara Ashadha (21)");
console.log("27-system:", getAnandadiYoga(6, 21, 27));
console.log("28-system:", getAnandadiYoga(6, 21, 28));

console.log("\nSaturday (6), Shravana (22)");
console.log("27-system:", getAnandadiYoga(6, 22, 27));
console.log("28-system:", getAnandadiYoga(6, 22, 28));
