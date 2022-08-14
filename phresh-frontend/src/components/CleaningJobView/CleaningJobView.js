import React from "react"
import { connect } from "react-redux"
import { Actions as cleaningActions } from "../../redux/cleanings"
import {
    EuiPage,
    EuiPageBody,
    EuiPageSection,
    EuiLoadingSpinner
} from "@elastic/eui"
import { CleaningJobCard, NotFoundPage } from "../../components"
import { useParams } from "react-router-dom"
import styled from "styled-components"

const StyledEuiPage = styled(EuiPage)`
  flex: 1;
`

function CleaningJobView({
    isLoading,
    cleaningError,
    currentCleaningJob,
    fetchCleaningJobById,
    clearCurrentCleaningJob
}) {
    const { cleaning_id } = useParams()

    React.useEffect(() => {
        if (cleaning_id) {
            fetchCleaningJobById({ cleaning_id })
        }

        return () => clearCurrentCleaningJob()
    }, [cleaning_id, fetchCleaningJobById, clearCurrentCleaningJob])

    if (isLoading) return <EuiLoadingSpinner size="xl" />
    if (!currentCleaningJob) return <EuiLoadingSpinner size="xl" />
    if (!currentCleaningJob?.name) return <NotFoundPage />

    return (
        <StyledEuiPage>
            <EuiPageBody component="section">
                <EuiPageSection>
                    <CleaningJobCard cleaningJob={currentCleaningJob} />
                </EuiPageSection>
            </EuiPageBody>
        </StyledEuiPage>
    )
}

export default connect(
    (state) => ({
        isLoading: state.cleanings.isLoading,
        cleaningError: state.cleanings.cleaningsError,
        currentCleaningJob: state.cleanings.currentCleaningJob
    }),
    {
        fetchCleaningJobById: cleaningActions.fetchCleaningJobById,
        clearCurrentCleaningJob: cleaningActions.clearCurrentCleaningJob
    }
)(CleaningJobView)

