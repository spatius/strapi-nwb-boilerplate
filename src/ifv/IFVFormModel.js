export const section1 =  {
  salaryMonthly: {
    label: "Mesecna placa",
    helpText: "Vnesite mesecno placo",
    required: false,
    type: "range",
    props: {
      min: 0,
      max: 50000
    },
    value: 4000
  },
  clubContractYearly: {
    label: "Pogodba s klubom (letno)",
    helpText: "Vnesite pogodbo",
    required: true,
    type: "range",
    props: {
      min: 0,
      max: 50000000
    },
    value: 40000
  },
  monthlySpendingHabit: {
    label: "Svoj osebni proračun imam pod kontrolo, tako da vsak mesec zapravim manj kot zaslužim",
    helpText: "",
    required: true,
    type: "radio-list",
    props: {
      items: [
        { label: "Da", value: "DA" },
        { label: "Ne", value: "NE" }
      ]
    },
    value: "NE"
  },
  abc: {
    label: "abc",
    helpText: "",
    required: true,
    type: "text",
    props: {
    },
    value: "abc abc"
  }
}
