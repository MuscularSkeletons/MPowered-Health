export type AppointmentQuestion={group:string;text:string};
export type PlannedAppointment={id:string;doctor:string;date:string;service:string;supportPerson?:string;questions?:AppointmentQuestion[];signaturePaths?:string[]};
let appointments:PlannedAppointment[]=[{id:'seed-appointment',doctor:'Dr. Maximiliano Prinzi',date:'10 June 2026',service:'General Practitioner (GP)'}];
export const getAppointments=()=>[...appointments];
export const getAppointment=(id?:string)=>appointments.find(item=>item.id===id)??appointments[0];
export const addAppointment=(appointment:Omit<PlannedAppointment,'id'>)=>{appointments=[...appointments,{...appointment,id:`appointment-${Date.now()}`}];};
export const saveAppointmentSignature=(id:string,signaturePaths:string[])=>{appointments=appointments.map(item=>item.id===id?{...item,signaturePaths:[...signaturePaths]}:item);};
