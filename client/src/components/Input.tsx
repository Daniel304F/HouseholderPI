type InputProps = {
    label: string
}

export default function Input({label}: InputProps) {
    return (
        <p className="flex flex-col gap-1 my-4">
            <label className="text-sm font-bold uppercase text-stone-500">
                {label}
            </label>
        </p>
    );
}