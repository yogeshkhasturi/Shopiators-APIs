export const welcomeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Shopiators API</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent-start: #3b82f6;
            --accent-end: #8b5cf6;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }

        /* Animated background blob */
        .blob {
            position: absolute;
            width: 600px;
            height: 600px;
            background: linear-gradient(to right, var(--accent-start), var(--accent-end));
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.15;
            animation: float 10s infinite ease-in-out alternate;
            z-index: 0;
        }

        @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(50px, -50px) scale(1.1); }
        }

        .container {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 2rem;
            max-width: 800px;
        }

        h1 {
            font-size: 4rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(to right, var(--accent-start), var(--accent-end));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: titleFadeIn 1s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }

        p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 3rem;
            animation: textFadeIn 1s ease-out 0.3s forwards;
            opacity: 0;
            transform: translateY(20px);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            padding: 1rem 2rem;
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            background: linear-gradient(to right, var(--accent-start), var(--accent-end));
            border: none;
            border-radius: 9999px;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
            animation: btnFadeIn 1s ease-out 0.6s forwards;
            opacity: 0;
            transform: translateY(20px);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(99, 102, 241, 0.5);
            filter: brightness(1.1);
        }

        .btn svg {
            margin-left: 0.5rem;
            width: 20px;
            height: 20px;
            transition: transform 0.3s ease;
        }

        .btn:hover svg {
            transform: translateX(4px);
        }

        @keyframes titleFadeIn {
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes textFadeIn {
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes btnFadeIn {
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="blob"></div>
    <div class="container">
        <img src="/shopiators-logo-white.png" alt="Shopiators Logo" style="max-height: 80px; margin-bottom: 2rem; animation: titleFadeIn 1s ease-out forwards; opacity: 0; transform: translateY(20px);">
        <h1>Welcome to Shopiators API</h1>
        <p>The core engine driving seamless integrations and powerful commerce solutions.</p>
        <a href="/sandbox" class="btn">
            Test & Run APIs in Sandbox
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
        </a>
    </div>
</body>
</html>
`;
