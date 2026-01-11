import { cn } from "@/lib/utils";

// Helper to get row letter (1->A, 2->B, etc.)
export const getRowLabel = (index) => {
  return String.fromCharCode(65 + index - 1); // 1 -> A, 2 -> B
};

export function SeatingGrid({ rows, cols, registrations, selectedSeat, onSelectSeat, readOnly = false, rowConfig }) {
    // Map of "row-col" -> Registration
    const occupiedSeats = new Map(registrations.map(r => [`${r.seatRow}-${r.seatCol}`, r]));

    return (
      <div className="w-full bg-white rounded-lg select-none flex flex-col items-center">
        
        {/* Stage / Screen Indicator - BookMyShow Style */}
        <div className="w-full mb-8 relative flex flex-col items-center">
             <div className="w-4/5 md:w-1/2 h-8 border-t-4 border-blue-300 rounded-t-[50%] shadow-[0_-10px_20px_-5px_rgba(59,130,246,0.2)]"></div>
             <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-2">Screen This Way</span>
        </div>

        {/* Pricing Info */}
        {!readOnly && (
            <div className="text-center mb-6">
                 <span className="inline-block px-3 py-1 bg-white text-slate-500 text-xs font-medium border border-slate-100 rounded-md shadow-sm">
                    Ticket Price: <span className="text-slate-900 font-bold">Free</span>
                 </span>
            </div>
        )}

        {/* Grid Container */}
        <div className="w-full overflow-x-auto pb-8 px-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="flex flex-col gap-3 items-center mx-auto min-w-max">
          {Array.from({ length: rows }).map((_, r) => {
             const rowNum = r + 1;
             const rowLabel = getRowLabel(rowNum);
             const seatsInRow = rowConfig ? (rowConfig[rowNum] || 0) : cols;
             
             return (
               <div key={rowNum} className="flex items-center gap-4 sm:gap-8">
                 {/* Row Label */}
                 <div className="w-6 text-right text-xs font-semibold text-slate-400">
                    {rowLabel}
                 </div>

                 {/* Seats */}
                 <div className="flex gap-2 sm:gap-3">
                   {Array.from({ length: seatsInRow }).map((_, c) => {
                       const colNum = c + 1;
                       const key = `${rowNum}-${colNum}`;
                       const isOccupied = occupiedSeats.has(key);
                       const isSelected = selectedSeat?.row === rowNum && selectedSeat?.col === colNum;
                       
                       return (
                         <button
                           key={key}
                           disabled={readOnly || isOccupied}
                           onClick={() => !readOnly && !isOccupied && onSelectSeat?.(rowNum, colNum)}
                           title={isOccupied ? `Occupied by ${occupiedSeats.get(key)?.studentName}` : `${rowLabel}${colNum}`}
                           className={cn(
                             "w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] text-[10px] font-medium transition-all duration-200 flex items-center justify-center border",
                             isOccupied
                               ? "bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed" // Sold
                               : isSelected
                                 ? "bg-green-500 text-white border-green-500 shadow-md transform scale-105" // Selected
                                 : "bg-white text-green-600 border-green-400 hover:bg-green-50" // Available
                           )}
                         >
                           {colNum}
                         </button>
                       );
                   })}
                 </div>
               </div>
             );
          })}
          </div>
        </div>

        {/* Legend */}
        <div className="w-full border-t border-slate-100 pt-6 mt-2">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 px-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-[4px] border border-green-400 bg-white"></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Available</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-[4px] bg-green-500 border border-green-500 shadow-sm"></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Selected</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-[4px] bg-slate-200 border border-slate-200"></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Sold</span>
                </div>
            </div>
        </div>
      </div>
    );
}
