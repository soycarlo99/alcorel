import { useState, useEffect } from "react";

export default function AdminDashboard()
{
    
    const companyId = localStorage.getItem("companyId");

    if (companyId == 1) {
    /*
    useEffect(() => {
        async function fetchTickets() {
            try {
                const response = await fetch(`/api/tickets?companyId=${companyId}`)
            }
        }
    })
    */

        return (
        <div className="dashboard">
            <h1>Admin Dashboard</h1>
            <p>Company ID: {companyId}</p>
        </div>
        )
    } else if (companyId == 2) {
        
    }


    /*
    useEffect(() => {
        async function fetchTickets() {
            try {
                const response = await fetch(`/api/tickets?companyId=${companyId}`)
            }
        }
    })
    */
}