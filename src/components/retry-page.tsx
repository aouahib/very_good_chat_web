import RetryButton from "../features/user/ui/components/retry-button";
import React from "react";
import {makeStyles} from "@material-ui/styles";

export type RetryPageProps = {
  onRetry: () => void,
  errorMessage: string,
}

const RetryPage = (props: RetryPageProps) => {
  const classes = useStyles();
  return (
    <div className={classes.root} data-testid='retry-button'>
      <RetryButton onClick={props.onRetry} message={props.errorMessage}/>
    </div>
  );
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
});

export default RetryPage;