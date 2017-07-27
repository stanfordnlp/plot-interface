import React from "react"
import "./styles.css"

const FormulasList = ({ formulas }) => {
  const formulaDivs = formulas.map((f, i) =>
    <div className='formula' key={`formula${i}`}>{f}</div>
  )
  return (
    <div className='formulas-list' key='formulas'>
      {formulaDivs}
    </div>
  )
}

export default FormulasList
