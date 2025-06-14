import{j as e}from"./ui-vendor-B29bBmtv.js";import{a as r}from"./react-vendor-CGPzL8fz.js";import{g as I,m as s,A as T,c as j,H as u,I as x}from"./index-CterjluU.js";import{u as B,w as n}from"./Dashboard-BH0zaBYM.js";import{b as H,c as h}from"./weight-logging-BIZ1MV3J.js";import{am as P}from"./utils-vendor-eZsCaz-O.js";import"./data-vendor-CtvEhjhB.js";import"./analytics-vendor-CXgENQ1a.js";import"./use-is-mounted-CwvR8lm8.js";import"./focus-management-6kc7Qb5h.js";import"./use-supabase-body-metrics-sPNI29eo.js";import"./input-BGHS8jIm.js";import"./label-CZr9RmgQ.js";import"./progress-BXncMp1R.js";import"./VersionDisplay-xo0BDl1-.js";import"./prefetch-DH02k7_E.js";import"./use-swipe-navigation-Br04oNeb.js";function ee({value:i,onChange:y}){const{setCanGoNext:o}=B(),[a,d]=r.useState(i.value),[z,b]=r.useState(!1),[w,f]=r.useState(!1),[N,l]=r.useState(!1),k=r.useRef(null),c=I.isNativePlatform();r.useEffect(()=>{n.startStep(2)},[]),r.useEffect(()=>{const t={value:a};try{H.parse(t),y(t),o(!0)}catch{o(!1)}},[a,y,o]);const S=async t=>{const m=h.snapToHalf(t);d(m),l(!0),c&&await u.impact({style:x.Light})},g=()=>{b(!0),f(!0)},v=()=>{b(!1),f(!1),N&&n.trackBodyFatInput({method:"slider_drag",final_value:a,snapped_to_increment:!0})},F=async t=>{c&&await u.impact({style:x.Medium}),d(t),l(!0),n.trackBodyFatInput({method:"tap_labels",final_value:t,snapped_to_increment:!0})},_=async t=>{c&&await u.impact({style:x.Light}),d(t.value),l(!0),n.trackBodyFatInput({method:"preset_chip",final_value:t.value,snapped_to_increment:!0})},C=h.getPresets(),E=h.getCategoryForValue(a),p=(a-3)/47*100;return e.jsxs(s.div,{className:"space-y-8",initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},transition:{duration:.25,type:"spring",damping:20},children:[e.jsxs("div",{className:"space-y-4 text-center",children:[e.jsx(s.div,{className:"mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10",whileHover:{scale:1.05},whileTap:{scale:.95},children:e.jsx(P,{className:"h-10 w-10 text-primary"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"mb-2 text-3xl font-bold text-foreground",children:"Body fat percentage?"}),e.jsx("p",{className:"text-lg text-muted-foreground",children:"Estimate or enter your body fat percentage"})]})]}),e.jsxs(s.div,{className:"space-y-2 text-center",initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.1,duration:.25},children:[e.jsxs("div",{className:"text-5xl font-bold text-foreground",children:[a.toFixed(1),"%"]}),e.jsx("div",{className:"text-lg text-muted-foreground",children:E})]}),e.jsx(s.div,{className:"space-y-6 px-4",initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.2,duration:.25},children:e.jsxs("div",{className:"relative",children:[e.jsx(T,{children:w&&e.jsxs(s.div,{className:"pointer-events-none absolute -top-12 z-10 rounded-lg bg-foreground px-3 py-1 text-sm font-medium text-background",style:{left:`calc(${p}% - 20px)`},initial:{opacity:0,y:10,scale:.8},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:10,scale:.8},transition:{duration:.2},children:[a.toFixed(1),"%",e.jsx("div",{className:"absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"})]})}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{ref:k,type:"range",min:"3",max:"50",step:"0.5",value:a,onChange:t=>S(parseFloat(t.target.value)),onMouseDown:g,onMouseUp:v,onTouchStart:g,onTouchEnd:v,className:"slider-enhanced h-4 w-full cursor-pointer bg-transparent",style:{background:`linear-gradient(to right, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary)) ${p}%, 
                  hsl(var(--secondary)) ${p}%, 
                  hsl(var(--secondary)) 100%)`},"aria-label":"Body fat percentage","aria-valuemin":3,"aria-valuemax":50,"aria-valuenow":a,"aria-valuetext":`${a.toFixed(1)} percent body fat`}),e.jsx("div",{className:"pointer-events-none absolute inset-0 flex items-center justify-between",children:[3,8,15,22,30,50].map(t=>{const m=(t-3)/47*100;return e.jsx("button",{onClick:()=>F(t),className:j("pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-200","hover:scale-110 active:scale-95",Math.abs(a-t)<1?"bg-primary text-primary-foreground":"bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"),style:{position:"absolute",left:`calc(${m}% - 16px)`},"aria-label":`Set body fat to ${t} percent`,children:t},t)})})]}),e.jsxs("div",{className:"mt-3 flex justify-between text-xs text-muted-foreground",children:[e.jsx("span",{children:"Essential (3%)"}),e.jsx("span",{children:"Athletic"}),e.jsx("span",{children:"Fitness"}),e.jsx("span",{children:"Acceptable"}),e.jsx("span",{children:"High (50%)"})]})]})}),e.jsxs(s.div,{className:"space-y-3",initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.3,duration:.25},children:[e.jsx("p",{className:"text-center text-sm font-medium text-muted-foreground",children:"Quick presets"}),e.jsx("div",{className:"grid grid-cols-2 gap-3",children:C.map(t=>e.jsxs(s.button,{onClick:()=>_(t),className:j("rounded-2xl border-2 p-4 text-center transition-all duration-200",Math.abs(a-t.value)<.5?"border-primary bg-primary text-primary-foreground":"border-transparent bg-secondary/20 text-foreground hover:border-border"),whileTap:{scale:.98},children:[e.jsxs("div",{className:"text-lg font-semibold",children:[t.value,"%"]}),e.jsx("div",{className:"text-sm opacity-80",children:t.label}),e.jsx("div",{className:"text-xs opacity-60",children:t.description})]},t.value))})]})]})}const $=`
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
`;if(typeof document<"u"){const i=document.createElement("style");i.textContent=$,document.head.appendChild(i)}export{ee as BodyFatStep};
