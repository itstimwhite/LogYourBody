import{j as e}from"./ui-vendor-BTNJdHiL.js";import{a as s}from"./react-vendor-CGPzL8fz.js";import{h as $,m as r,c as x,A as N,H as h,I as y}from"./index-BWixOZri.js";import{u as z,w as n}from"./Dashboard-jXZD-6ec.js";import{b as A,c as o}from"./weight-logging-rZoVubPW.js";import{am as B,K as M}from"./utils-vendor-BD55slVq.js";import"./data-vendor-Dz4nk24n.js";import"./analytics-vendor-CXgENQ1a.js";import"./use-is-mounted-Dtnm4exq.js";import"./focus-management-6kc7Qb5h.js";import"./input-CkE6ZwYN.js";import"./label-DJ6QZZke.js";import"./progress-DaDOMKAa.js";import"./VersionDisplay-BrEkyV1W.js";import"./prefetch-BKo02pYs.js";import"./use-supabase-body-metrics-D-84L7_Y.js";import"./use-swipe-navigation-Br04oNeb.js";function re({value:i,onChange:g}){const{setCanGoNext:d}=z(),[a,l]=s.useState(i.value),[D,b]=s.useState(!1),[k,f]=s.useState(!1),[S,c]=s.useState(!1),F=s.useRef(null),p=$.isNativePlatform();s.useEffect(()=>{n.startStep(2)},[]),s.useEffect(()=>{const t={value:a};try{A.parse(t),g(t),d(!0)}catch{d(!1)}},[a,g,d]);const _=async t=>{const u=o.snapToHalf(t);l(u),c(!0),p&&await h.impact({style:y.Light})},v=()=>{b(!0),f(!0)},j=()=>{b(!1),f(!1),S&&n.trackBodyFatInput({method:"slider_drag",final_value:a,snapped_to_increment:!0})},C=async t=>{p&&await h.impact({style:y.Medium}),l(t),c(!0),n.trackBodyFatInput({method:"tap_labels",final_value:t,snapped_to_increment:!0})},E=async t=>{p&&await h.impact({style:y.Light}),l(t.value),c(!0),n.trackBodyFatInput({method:"preset_chip",final_value:t.value,snapped_to_increment:!0})},H=o.getPresets(),I=o.getCategoryForValue(a),w=o.getHealthWarning(a),m=(a-4)/46*100,T=e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"space-y-4 text-center",children:[e.jsx(r.div,{className:"mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10",whileHover:{scale:1.05},whileTap:{scale:.95},children:e.jsx(B,{className:"h-10 w-10 text-primary"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"mb-2 text-3xl font-bold text-foreground",children:"Body fat percentage?"}),e.jsx("p",{className:"text-lg text-muted-foreground",children:"Estimate or enter your body fat percentage"})]})]}),e.jsxs(r.div,{className:"space-y-2 text-center",initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.1,duration:.25},children:[e.jsxs("div",{className:"text-5xl font-bold text-foreground",children:[a.toFixed(1),"%"]}),e.jsx("div",{className:x("text-lg",a<6?"text-destructive font-semibold":"text-muted-foreground"),children:I})]}),e.jsx(N,{children:w&&e.jsx(r.div,{initial:{opacity:0,y:-10,height:0},animate:{opacity:1,y:0,height:"auto"},exit:{opacity:0,y:-10,height:0},transition:{duration:.3},className:"mx-4 overflow-hidden",children:e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-destructive/10 p-4",children:[e.jsx(M,{className:"mt-0.5 h-5 w-5 flex-shrink-0 text-destructive"}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-semibold text-destructive",children:"Health Warning"}),e.jsx("p",{className:"text-sm text-destructive/90",children:w})]})]})})}),e.jsx(r.div,{className:"space-y-6 px-4",initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.2,duration:.25},children:e.jsxs("div",{className:"relative",children:[e.jsx(N,{children:k&&e.jsxs(r.div,{className:"pointer-events-none absolute -top-12 z-10 rounded-lg bg-foreground px-3 py-1 text-sm font-medium text-background",style:{left:`calc(${m}% - 20px)`},initial:{opacity:0,y:10,scale:.8},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:10,scale:.8},transition:{duration:.2},children:[a.toFixed(1),"%",e.jsx("div",{className:"absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"})]})}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{ref:F,type:"range",min:"4",max:"50",step:"0.5",value:a,onChange:t=>_(parseFloat(t.target.value)),onMouseDown:v,onMouseUp:j,onTouchStart:v,onTouchEnd:j,className:"slider-enhanced h-4 w-full cursor-pointer bg-transparent",style:{background:`linear-gradient(to right, 
                    ${a<6?"hsl(var(--destructive))":"hsl(var(--primary))"} 0%, 
                    ${a<6?"hsl(var(--destructive))":"hsl(var(--primary))"} ${m}%, 
                    hsl(var(--secondary)) ${m}%, 
                    hsl(var(--secondary)) 100%)`},"aria-label":"Body fat percentage","aria-valuemin":4,"aria-valuemax":50,"aria-valuenow":a,"aria-valuetext":`${a.toFixed(1)} percent body fat`,"data-warning":a<6}),e.jsx("div",{className:"pointer-events-none absolute inset-0 flex items-center justify-between",children:[4,8,15,22,30,50].map(t=>{const u=(t-4)/46*100;return e.jsx("button",{onClick:()=>C(t),className:x("pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-200","hover:scale-110 active:scale-95",Math.abs(a-t)<1?"bg-primary text-primary-foreground":"bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"),style:{position:"absolute",left:`calc(${u}% - 16px)`},"aria-label":`Set body fat to ${t} percent`,children:t},t)})})]}),e.jsxs("div",{className:"mt-3 flex justify-between text-xs text-muted-foreground",children:[e.jsx("span",{className:a<6?"text-destructive font-semibold":"",children:"Min (4%)"}),e.jsx("span",{children:"Athletic"}),e.jsx("span",{children:"Fitness"}),e.jsx("span",{children:"Acceptable"}),e.jsx("span",{children:"High (50%)"})]})]})}),e.jsxs(r.div,{className:"space-y-3",initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.3,duration:.25},children:[e.jsx("p",{className:"text-center text-sm font-medium text-muted-foreground",children:"Quick presets"}),e.jsx("div",{className:"grid grid-cols-2 gap-3",children:H.map(t=>e.jsxs(r.button,{onClick:()=>E(t),className:x("rounded-2xl border-2 p-4 text-center transition-all duration-200",Math.abs(a-t.value)<.5?"border-primary bg-primary text-primary-foreground":"border-transparent bg-secondary/20 text-foreground hover:border-border"),whileTap:{scale:.98},children:[e.jsxs("div",{className:"text-lg font-semibold",children:[t.value,"%"]}),e.jsx("div",{className:"text-sm opacity-80",children:t.label}),e.jsx("div",{className:"text-xs opacity-60",children:t.description})]},t.value))})]})]});return e.jsx(r.div,{className:"space-y-8",initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},transition:{duration:.25,type:"spring",damping:20},children:T})}const P=`
  .slider-enhanced::-webkit-slider-thumb {
    appearance: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 4px solid hsl(var(--background));
    transition: all 0.2s ease;
  }

  .slider-enhanced[data-warning="true"]::-webkit-slider-thumb {
    background: hsl(var(--destructive));
  }

  .slider-enhanced::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  .slider-enhanced::-webkit-slider-thumb:active {
    transform: scale(1.15);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .slider-enhanced::-webkit-slider-track {
    height: 16px;
    border-radius: 8px;
    border: none;
  }

  .slider-enhanced::-moz-range-thumb {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: hsl(var(--primary));
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 4px solid hsl(var(--background));
    transition: all 0.2s ease;
  }

  .slider-enhanced[data-warning="true"]::-moz-range-thumb {
    background: hsl(var(--destructive));
  }

  .slider-enhanced::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  .slider-enhanced::-moz-range-thumb:active {
    transform: scale(1.15);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .slider-enhanced::-moz-range-track {
    height: 16px;
    border-radius: 8px;
    border: none;
  }
`;if(typeof document<"u"){const i=document.createElement("style");i.textContent=P,document.head.appendChild(i)}export{re as BodyFatStep};
