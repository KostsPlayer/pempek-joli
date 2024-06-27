//   const [openDropdown, setOpenDropdown] = useState(false);
//   <div className="shipping-method">
//     <div
//       className={`dropdown ${openDropdown ? "open" : ""}`}
//       onClick={() => {
//         setOpenDropdown(!openDropdown);
//       }}
//     >
//       <div className="method">
//         <div className="text">JNA</div>
//         <div className="amount">30000</div>
//       </div>
//       <div className="method">
//         <div className="text">JNB</div>
//         <div className="amount">30000</div>
//       </div>
//       <div className="method">
//         <div className="text">JNC</div>
//         <div className="amount">30000</div>
//       </div>
//     </div>
//   </div>;

// SCSS

// .shipping-method {
//     padding-top: 0.6rem;

//     .dropdown {
//       @include m.flex(
//         $direction: column,
//         $align: flex-start,
//         $justify: flex-start
//       );
//       max-height: 2.4rem;
//       padding: 0.4rem;
//       overflow: hidden;
//       transition: max-height 0.35s ease-in-out;
//       border: #000 0.1rem solid;
//       border-radius: 0.4rem;
//       gap: 0.4rem;

//       &.open {
//         max-height: 7.2rem;
//       }

//       .method {
//         width: 100%;
//         height: auto;
//         @include m.flex($justify: space-between);
//         font-weight: 500;
//       }
//     }
//   }
