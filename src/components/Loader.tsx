import { Box, CircularProgress, Grid } from "@material-ui/core";

interface LoaderProps {
	fullScreen?: boolean;
	size?: number; 
}

export function Loader(props: LoaderProps) {
	return <Grid
		style={{ width: props.fullScreen ? '100vw' : '100%', height: props.fullScreen ? '100vh' : '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<Box sx={{ width: '100%' }}>
			<CircularProgress size={props.size || 150} />
		</Box>
	</Grid>;
}