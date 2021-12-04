import { Client } from "aedes"

export default  (_client: Client,username: string, _password: Buffer, callback:(error: Error|null, successful:boolean) => void)=>{
    if(password==undefined){return callback(null,false)}
    const password=_password.toString("utf-8");
    console.log("authenticating "+username+" pass: "+password)
    const lengthEqualTo= (input:string,n:number)=>{return input.length==n;}
    const passwordLength8=lengthEqualTo(password,8);
    const usernameLength8=lengthEqualTo(username,8);
    console.log(`len==8 username:${usernameLength8} password:${passwordLength8}`);
    
    const passwordBeginswithP = password.substring(0,1)==="P";
    console.log("Password Begins with P: ",passwordBeginswithP)
   if(usernameLength8 && passwordLength8 && passwordBeginswithP){
       callback(null,true);
   }else{
    callback(null,false)
   }
}
