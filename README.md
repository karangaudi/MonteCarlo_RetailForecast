# 🧮 Monte Carlo Simulation for Retail Revenue Forecasting

## 📊 Overview
This project uses Monte Carlo simulation to estimate the probability of exceeding a quarterly revenue target in a retail business. It combines statistical modeling in Python with an interactive decision support app built using Windsurf.

## 🧠 Business Problem
Retail managers face uncertainty in demand and pricing. Using historical sales data, we simulate 10,000 quarterly revenue outcomes to answer:

> “What is the probability that total revenue will exceed £100K next quarter?”


## 📥 Dataset
- **Source:** [UCI Online Retail Dataset](https://archive.ics.uci.edu/ml/datasets/Online+Retail)
- **Contents:** Transactions from a UK-based online retailer (2010–2011), including product descriptions, quantities, prices, and timestamps.

## 🔬 Monte Carlo Simulation
- **Tool:** Google Colab
- **Steps:**
  - Data cleaning and exploration
  - Distribution fitting (normal)
  - Simulation of 10,000 quarterly outcomes
  - Confidence intervals and probability estimates
- **Notebook:** [View on Google Colab](https://colab.research.google.com/your-link)

## 🌐 Decision Support App
- **Platform:** Windsurf IDE
- **Features:**
  - Sliders to adjust average revenue and uncertainty
  - Input field for revenue target
  - Real-time simulation results
  - Confidence interval display
  - Risk level indicator
- **Live App:** [Hosted on Windsurf](https://windsurf.ai/your-app-url)

## 📝 Executive Summary
- Summarizes the problem, dataset, model, findings, and recommendations
- Includes screenshots of the app and stakeholder guidance
- **File:** [`executive_summary.pdf`](executive_summary.pdf)

## 🚀 Setup Instructions (Optional for Local Dev)
If you want to run the app locally:

```bash
cd windsurf_app
npm install
npm run dev

Team Contributions
Karan Gaudi: Colab analysis, model validation, executive summary


