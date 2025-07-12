import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getData } from "country-list";
import { ControllerRenderProps } from "react-hook-form";
type Props = {
  field: ControllerRenderProps<any, any>; 
  isSubmitting?: boolean;
  isPending?: boolean;
};

export default function CountrySelect({
  field,
  isSubmitting = false,
  isPending = false
}: Props) {
  isSubmitting: boolean = false,
  isPending: boolean = false
) {
  const countries = getData();
  return (
    <Select
      onValueChange={field.onChange}
      value={field.value}
      defaultValue={field.value}
      disabled={isSubmitting || isPending}
    >
      <SelectTrigger
        ref={field.ref}
        onBlur={field.onBlur}
        className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
      >
        <SelectValue placeholder="Country/region" />
      </SelectTrigger>
      <SelectContent>
        {countries
          .sort(
            (
              a: { code: string; name: string },
              b: { code: string; name: string }
            ) =>
              a.name.localeCompare(b.name, "en", {
                sensitivity: "base",
              })
          )
          .map((country: { code: string; name: string }) => (
            <SelectItem key={country.code} value={country.code.toLowerCase()}>
              {country.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
