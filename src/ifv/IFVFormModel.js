export const section1 =  {
  salaryMonthly: {
    label: "Mesecna placa",
    helpText: "Vnesite mesecno placo",
    required: false,
    question: {
      type: "range",
      from: 0,
      to: 50000,
      defaultValue: 4000
    }
  },
  clubContractYearly: {
    label: "Pogodba s klubom (letno)",
    helpText: "Vnesite pogodbo",
    required: true,
    question: {
      type: "range",
      from: 0,
      to: 50000000,
      defaultValue: 40000
    }
  },
  monthlySpendingHabit: {
    label: "Svoj osebni proračun imam pod kontrolo, tako da vsak mesec zapravim manj kot zaslužim",
    helpText: "",
    required: true,
    question: {
      type: "list",
      options: ["Da", "Ne"],
      defaultValue: 0
    }
  }
}
