import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith("/admin")) {
        return token?.role === "admin";
      }
      // For other protected areas, require any authenticated user
      if (pathname.startsWith("/klijent") || pathname.startsWith("/partner")) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/klijent/:path*", "/partner/:path*"],
};


