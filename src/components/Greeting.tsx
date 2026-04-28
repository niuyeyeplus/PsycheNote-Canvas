import type { FC } from 'react';

interface GreetingProps {
  name: string;
}

const Greeting: FC<GreetingProps> = ({ name }) => <div>{`Hello, ${name}!`}</div>;

export default Greeting;
