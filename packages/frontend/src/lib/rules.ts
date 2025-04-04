
function name(mandatoryMessage: string, maxLengthMessage: number) {
  return [
    v => !!v || mandatoryMessage,
    v => v.length <= 255 || maxLengthMessage,
  ]
}

function email(mandatoryMessage: string, maxLengthMessage: string, validMessage: string) {
  return [
    v => !!v || mandatoryMessage,
    v => v.length <= 255 || maxLengthMessage,
    v => {
      if (v.indexOf('@') === -1 || v.indexOf('.') === -1) return validMessage; 
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || validMessage;
    }
  ]
}

function pwd(mandatoryMessage: string, lengthMessage: string){
  return [
    v => !!v || mandatoryMessage,
    v => v.length >= 6 && v.length <= 255 || lengthMessage,    
  ]
}

export default {
  name,
  email,
  pwd
}