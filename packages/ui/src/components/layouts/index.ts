/**
 * ATLVS Layout Primitives
 * Zero Tolerance: 100% Normalized Layout System
 * 
 * All layout components export semantic, reusable primitives
 * No hardcoded dimensions or inline styles allowed
 */

export { Box, type BoxProps } from './Box'
export { Stack, HStack, VStack, type StackProps } from './Stack'
export { Grid, GridItem, type GridProps, type GridItemProps } from './Grid'
export { Container, type ContainerProps } from './Container'
export { Spacer, type SpacerProps } from './Spacer'
export { Divider, type DividerProps } from './Divider'

/**
 * Usage Examples:
 * 
 * @example Box - Universal container
 * <Box padding="md" bg="card" rounded="lg">Content</Box>
 * 
 * @example Stack - Flex layouts
 * <Stack direction="vertical" spacing="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * @example Grid - Grid layouts
 * <Grid cols={4} spacing="md" responsive={{ sm: 2, lg: 4 }}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Grid>
 * 
 * @example Container - Content containers
 * <Container size="7xl" centered paddingX="md">
 *   Content
 * </Container>
 */
