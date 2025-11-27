'use client';

import { useMe } from "@/contexts/MeContext";
import Stack from "@/components/common/Stack";
import TextField from "@/components/common/TextField";
import ProfileCard from "@/components/browsing/ProfileCard";
import { calculateAge } from "@/lib/searchUtils";
import { GENDER_OPTIONS , ORIENTATION_OPTIONS } from "@/constants/onboarding";
import { useState, useEffect } from "react";

function onChange(field: string, value: any) {
    console.log(`Field ${field} changed to`, value);
}

export default function MePage() {
    const me = useMe();

    const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
    const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
    const [genderError, setGenderError] = useState<string | undefined>(undefined);
    const [birthdateError, setBirthdateError] = useState<string | undefined>(undefined);
    const [orientationError, setOrientationError] = useState<string | undefined>(undefined);

    useEffect(() => {
        const trimmedFirstName = me.firstName.trim()
        if (trimmedFirstName === '') {
            setFirstNameError('First name cannot be empty');
        } else if (trimmedFirstName.length > 50) {
            setFirstNameError('First name cannot be longer than 50 characters');
        } else {
            setFirstNameError(undefined);
        }

        const trimmedLastName = me.lastName.trim()
        if (trimmedLastName.length > 50) {
            setLastNameError('Last name cannot be longer than 50 characters');
        } else if (trimmedLastName === '') {
            setLastNameError('Last name cannot be empty');
        } else {
            setLastNameError(undefined);
        }

        if (!me.birthdate || isNaN(me.birthdate.getTime())) {
            setBirthdateError('Invalid birthdate');
        } else {
            setBirthdateError(undefined);
        }

        const today = new Date();
        const heightensAgo = today.setFullYear(today.getFullYear() - 18);

        if (heightensAgo - (me.birthdate as Date).getTime() < 0)
        {
            setBirthdateError('You must be at least 18 years old');
        }

    }, [me.firstName, me.lastName, me.birthdate, me.orientation]);

    return (
        <div className="flex flex-row w-full" >
            <Stack spacing="md" align="start" className="w-full p-0 mx-0 md:w-[300px] bg-white min-h-full border border-gray-200" >
                <h1 className="mx-4" >My Profile</h1>
                {me.isLoading && <p>Loading...</p>}
                {me.error && (
                    <div>
                        <p>Error loading profile: {me.error}</p>
                        <button onClick={me.refresh}>Retry</button>
                    </div>
                )}
                {!me.isLoading && !me.error && ( <>
                    <TextField className="rounded-none bg-white" fullWidth={true} label="ID" value={String(me.id)} readOnly={true} />
                    <TextField className="rounded-none bg-white" fullWidth={true} label="Email" value={me.email} readOnly={true} />
                    <TextField className="rounded-none bg-white" fullWidth={true} label="Username" value={me.username} readOnly={true} />
                    <TextField className="rounded-none bg-white" fullWidth={true} label="First Name" value={me.firstName} error={firstNameError} onChange={e => me.setFirstName(e.target.value)} />
                    <TextField className="rounded-none bg-white" fullWidth={true} label="Last Name" value={me.lastName} error={lastNameError} onChange={e => me.setLastName(e.target.value)} />
                    <TextField className="rounded-none bg-white" fullWidth={true} label="Birthdate" type="date" value={me.birthdate?.toISOString().split('T')[0] || ''} error={birthdateError} onChange={e => me.setBirthdate(new Date(e.target.value))} />
                    <select
                        value={me.gender}
                        onChange={(e) => me.setGender(e.target.value)}
                        className={`
                                    w-full px-4 py-3
                                    border rounded-md
                                    transition-all
                                    focus:outline-none focus:ring-2 focus:border-transparent
                                    ${
                            genderError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-pink-500"
                        }
                                `}
                    >
                        {GENDER_OPTIONS.map((option) => 
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        )}
                    </select>
                    <select
                        value={me.orientation}
                        onChange={(e) => me.setOrientation(e.target.value)}
                        className={`
                                    w-full px-4 py-3
                                    border rounded-md
                                    transition-all
                                    focus:outline-none focus:ring-2 focus:border-transparent
                                    ${
                            orientationError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-pink-500"
                        }
                                `}
                    >
                        {ORIENTATION_OPTIONS.map((option) => 
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        )}
                    </select>
                </>)}
            </Stack>
            { !me.isLoading && !me.error && (
                <div className="hidden lg:flex grow justify-center items-start p-4" >
                    <div className="grid grid-cols-1 w-100 h-130 xl:w-140 xl:h-180 gap-4 p-4">
                        <ProfileCard onClick={() => {}} key={String(me.id)} id={String(me.id)} name={me.firstName} age={calculateAge(me.birthdate?.toDateString() as string)} pictureUrl={(me.profilePictureUrls?.length > 0 && me.profilePictureIndex !== null) ? me.profilePictureUrls[me.profilePictureIndex] : '/default-profile.svg'}></ProfileCard>
                    </div>
                </div>
            )}
        </div>
    );
}