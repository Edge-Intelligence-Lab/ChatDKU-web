import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/constants";
import { getNewSession } from "@/lib/convosNew";

export default function WelcomeBanner() {
	const [me, setMe] = useState<{ netid: string; username: string } | null>(
		null,
	);

	useEffect(() => {
		fetch(API_ENDPOINTS.USER, { credentials: "include" })
			.then((res) => (res.ok ? res.json() : null))
			.then(async (user) => {
				setMe(user);
				if (user) {
					await getNewSession();
				}
			});
	}, []);

	if (!me)
		return (
			<h1 className="text-xl md:text-2xl lg:text-3xl">Welcome to ChatDKU</h1>
		); // still loading or not logged in
	return (
		<h1 className="text-2xl lg:text-3xl">
			Welcome, {me.username}!
		</h1>
	);
}
