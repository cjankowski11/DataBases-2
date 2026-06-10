import { EmployeeFormBase } from "./employee-create-base";

export default function NewGeneralEmployeeView() {
  return (
    <EmployeeFormBase 
      title="Add General Employee" 
      submitUrl="/" 
    />
  );
}