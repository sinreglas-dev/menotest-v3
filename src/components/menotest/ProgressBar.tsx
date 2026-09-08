interface Props {
   current: number;
   total: number;
}

export default function ProgressBar({
   current,
   total
}: Props) {

   const percentage =
      Math.min(
         100,
         Math.max(
            0,
            (current / total) * 100
         )
      );

   return (
      <div
         className="h-2 w-full overflow-hidden rounded-full bg-[#eee8ee] "
      >
         <div
            className="h-full rounded-full bg-[#6e0b6c] transition-all duration-500 ease-out"
            style={{
               width: `${percentage}%`
            }}
         />
      </div>
   );
}